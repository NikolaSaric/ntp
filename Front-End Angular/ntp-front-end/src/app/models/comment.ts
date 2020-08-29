export class Comment {

    constructor(body: string) {
        this.body = body;
    }

    id: string;
    commentID: string;
    postID: string;
    author: string;
    body: string;
    replies: Comment[];
    createdOn: string;
}
