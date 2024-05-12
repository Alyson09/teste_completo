import { UserDatabase } from '../data/userDatabase';
import { allGetUsers, getUserID, getProfile } from '../business/userBusiness';
import { CustomError } from '../errors/CustomError';
import { Request, Response } from 'express';

jest.mock('../model/User', () => {
    return {
        User: jest.fn().mockImplementation(() => {
            return {
                getId: jest.fn().mockReturnValue('35b62ff4-64af-4721-a4c5-d038c6f730cf'),
                getName: jest.fn().mockReturnValue(' Rubens'),
                getEmail: jest.fn().mockReturnValue('Rubens@example.com'),
                getRole: jest.fn().mockReturnValue('ADMIN'),
            };
        }),
    };
});
describe('BuscarUsuPOrID', () => {
    let mockUserDatabase: UserDatabase;
    let getUserService: getUserID;

    beforeEach(() => {
        mockUserDatabase = new UserDatabase();
        getUserService = new getUserID(mockUserDatabase);
    });

    it('Lançar um erro para usuário inexistente', async () => {
        try {
            await getUserService.getUserById('não existe esse id');
        } catch (error) {
            expect(error).toBeInstanceOf(CustomError);
            expect(error.statusCode).toBe(404);
            expect(error.message).toBe('not found');
        }
    });

    it('retornar os dados do usuário para um usuário existente', async () => {
        const mockUser = new (require('../model/User').User)();
        await mockUserDatabase.addUser(mockUser);
        const result = await getUserService.getUserById('123');
        expect(result).toEqual({
            id: '35b62ff4-64af-4721-a4c5-d038c6f730cf',
            name: 'Rubens',
            email: 'Rubens@example.com',
            role: 'ADMIN',
        });
    });
});


describe('BuscartodosUsuarios', () => {
    let mockUserDatabase: UserDatabase;
    let getAll: allGetUsers;
    let mockRequest: Partial<Request>;
    let mockResponse: Partial<Response>;

    beforeEach(() => {
        mockUserDatabase = new UserDatabase();
        getAll = new allGetUsers(mockUserDatabase);
        mockRequest = { body: {} };
        mockResponse = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            send: jest.fn(),
        };
    });

    it('Usuário não autorizado', async () => {
        mockRequest.body.role = '';

        await getAll.getAllUsers(mockRequest as Request, mockResponse as Response);

        expect(mockResponse.status).toHaveBeenCalledWith(403);
        expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Precisa de acesso de admin' });
    });

    it('deve retornar todos os usuários', async () => {
        await mockUserDatabase.addUser(new (require('../model/User').User)());
        await mockUserDatabase.addUser(new (require('../model/User').User)());

        mockRequest.body.role = 'ADMIN';

        await getAll.getAllUsers(mockRequest as Request, mockResponse as Response);
        expect(mockResponse.status).toHaveBeenCalledWith(200);
        expect(mockResponse.send).toHaveBeenCalled();
    });
});


interface MockRequest extends Request {
    user?: {
        id: string;
    };
}

describe('BuscarPerfil', () => {
    let mockUserDatabase: UserDatabase;
    let getUserProfile: getProfile;
    let mockRequest: MockRequest;
    let mockResponse: Partial<Response>;

    beforeEach(() => {
        mockUserDatabase = new UserDatabase();
        getUserProfile = new getProfile(mockUserDatabase);
        mockRequest = { user: { id: '35b62ff4-64af-4721-a4c5-d038c6f730cf' } } as MockRequest;
        mockResponse = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };
    });

    it('Adiciona o usuário no banco de dados', async () => {
        await mockUserDatabase.addUser(new (require('../model/User').User)());

        await getUserProfile.getUserProfile(mockRequest, mockResponse as Response);
        expect(mockResponse.status).toHaveBeenCalledWith(200);
        expect(mockResponse.json).toHaveBeenCalledWith({
            id: '35b62ff4-64af-4721-a4c5-d038c6f730cf',
            name: 'Rubens',
            email: 'rubens@example.com',
            role: 'ADMIN',
        });
    });

    it('Não adiciona o usuário no banco de dados', async () => {
        await getUserProfile.getUserProfile(mockRequest, mockResponse as Response);
        expect(mockResponse.status).toHaveBeenCalledWith(404);
        expect(mockResponse.json).toHaveBeenCalledWith({ message: 'User not found' });
    });
});