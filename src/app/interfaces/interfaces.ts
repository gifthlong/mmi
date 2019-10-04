
export interface TokenResponse {
    idToken: string;
    localId: string;
    refreshToken: string;
    expiresIn: number;
}

export interface Credentials {
    email: string;
    password: string;
    returnSecureToken: true
}

export interface UserDetails {
    accounts: number[];
    age: number;
    name: string;
}

export interface AccountSummary {
    accountNumber: number;
    balance: number;
    overdraft: number;
}