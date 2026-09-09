const principalIdentifierPattern = /^[A-Za-z0-9][A-Za-z0-9._-]{0,127}$/;

export interface AdminCapability {
    kind: 'admin';
    principalId: string;
    assurance: 'callerSupplied';
}

export interface PsychologistAuthorCapability {
    kind: 'psychologistAuthor';
    psychologistId: string;
    assurance: 'callerSupplied';
}

const assertPrincipalIdentifier = (value: string) => {
    if (!principalIdentifierPattern.test(value)) {
        throw new Error('Invalid caller-supplied capability identifier.');
    }
};

export const createAdminCapability = (principalId: string): AdminCapability => {
    assertPrincipalIdentifier(principalId);
    return Object.freeze({ kind: 'admin', principalId, assurance: 'callerSupplied' });
};

export const createPsychologistAuthorCapability = (psychologistId: string): PsychologistAuthorCapability => {
    assertPrincipalIdentifier(psychologistId);
    return Object.freeze({ kind: 'psychologistAuthor', psychologistId, assurance: 'callerSupplied' });
};
