export class Post {

    constructor(name: string, description: string, links: string[], tags: string[]) {
        this.name = name;
        this.description = description;
        this.links = links;
        this.tags = tags;
    }

    id: string;
    username: string;
    name: string;
    description: string;
    categories: string[];
    links: string[];
    tags: string[];
    createdOn: string;
}
