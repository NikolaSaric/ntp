export class Post {

    constructor(title: string, category: string, description: string, type: string,
                location: string, instruments: string[], tags: string[]) {
        this.title = title;
        this.category = category;
        this.description = description;
        this.type = type;
        this.location = location;
        this.instruments = instruments;
        this.tags = tags;
    }

    id: string;
    username: string;
    title: string;
    category: string;
    description: string;
    type: string;
    location: string;
    instruments: string[];
    tags: string[];
    createdOn: string;
}
