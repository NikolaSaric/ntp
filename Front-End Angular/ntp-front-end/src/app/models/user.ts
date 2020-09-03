export class User {
    constructor(public username: string,  public fullName: string,
                public email: string, public description: string,
                public admin: boolean, public registrationDate: string, public following: string[]) { }
}
