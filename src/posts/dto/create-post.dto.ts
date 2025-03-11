export class CreatePostDto {
  title: string;
  body: string;
  status: status;
}

enum status {
  DELETED = 'DELETED',
  SAVED = 'SAVED',
  DRAFT = 'DRAFT',
}
