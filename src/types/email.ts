

export interface RequestEmailData {
    email: string;
    purpose: string;
    amount: number;
    date: Date;
    reference: string;
}

export interface AllocationEmailParams {
    to: string;
    donorName: string;
    amountUsed: number;
    purpose: string;
    disbursementDate: Date | null;
    isBeneficiary?: boolean;
}