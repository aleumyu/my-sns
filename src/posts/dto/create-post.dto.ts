export class CreatePostDto {
  // authorId: string;
  title: string;
  body: string;
  status: status;
  // createdAt: Date;
}

enum status {
  DELETED = 'DELETED',
  SAVED = 'SAVED',
  DRAFT = 'DRAFT',
}
