import request from 'supertest';
import express from 'express';
import axios from 'axios';
import { app } from './server'; // Assuming the server code is in server.js

jest.mock('axios');

describe('GET /account-status/:address', () => {
    it('returns account status and balances for a valid address', async () => {
        const address = 'validAddress';
        const accountData = {
            status: 'active',
            balance: 1000,
            last_transaction: '2023-10-01T00:00:00Z'
        };
        const usdtBalance = 500;

        (axios.get as jest.Mock).mockImplementation((url) => {
            if (url.includes('/jettons')) {
                return Promise.resolve({ data: [{ symbol: 'USDT', balance: usdtBalance }] });
            }
            return Promise.resolve({ data: accountData });
        });

        const response = await request(app).get(`/account-status/${address}`);

        expect(response.status).toBe(200);
        expect(response.body).toEqual({
            success: true,
            status: accountData.status,
            balance: accountData.balance,
            usdtBalance: usdtBalance,
            lastTransaction: accountData.last_transaction
        });
    });

    it('returns an error message if the account is not found', async () => {
        const address = 'invalidAddress';

        (axios.get as jest.Mock).mockResolvedValue({ data: null });

        const response = await request(app).get(`/account-status/${address}`);

        expect(response.status).toBe(200);
        expect(response.body).toEqual({
            success: false,
            message: 'Account not found.'
        });
    });

    it('returns a server error message if an exception occurs', async () => {
        const address = 'errorAddress';

        (axios.get as jest.Mock).mockRejectedValue(new Error('Server error'));

        const response = await request(app).get(`/account-status/${address}`);

        expect(response.status).toBe(500);
        expect(response.body).toEqual({
            success: false,
            message: 'Server error. Please try again later.'
        });
    });
});