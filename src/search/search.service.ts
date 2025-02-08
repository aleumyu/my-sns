import { Injectable } from '@nestjs/common';
import { ElasticsearchService } from '@nestjs/elasticsearch';

interface PostSearchBody {
  id: number;
  title: string;
  content: string;
  authorId: number;
}

interface PostSearchResult {
  hits: {
    total: number;
    hits: Array<{
      _source: PostSearchBody[];
    }>;
  };
}

@Injectable()
export default class SearchService {
  index = 'posts';

  constructor(private readonly elasticsearchService: ElasticsearchService) {}

  async indexPost(post) {
    const { id, title, body, authorId } = post;
    return this.elasticsearchService.index<PostSearchBody>({
      index: this.index,
      body: {
        id,
        title,
        content: body,
        authorId,
      },
    });
  }

  async search(text: string) {
    const result = await this.elasticsearchService.search<PostSearchResult>({
      index: this.index,
      body: {
        query: {
          multi_match: {
            query: text,
            fields: ['title', 'content'],
          },
        },
      },
    });
    console.log('hola es result', JSON.stringify(result, null, 2));
    return result.hits.hits.map((item) => item._source);
  }

  // async remove(postId: number) {
  //   this.elasticsearchService.deleteByQuery({
  //     index: this.index,
  //     body: {
  //       query: {
  //         match: {
  //           id: postId,
  //         },
  //       },
  //     },
  //   });
  // }

  // async update(post: Post) {
  //   const newBody: PostSearchBody = {
  //     id: post.id,
  //     title: post.title,
  //     content: post.content,
  //     authorId: post.author.id,
  //   };

  //   const script = Object.entries(newBody).reduce((result, [key, value]) => {
  //     return `${result} ctx._source.${key}='${value}';`;
  //   }, '');

  //   return this.elasticsearchService.updateByQuery({
  //     index: this.index,
  //     body: {
  //       query: {
  //         match: {
  //           id: post.id,
  //         },
  //       },
  //       script: {
  //         inline: script,
  //       },
  //     },
  //   });
  // }
}
