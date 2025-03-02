import { Injectable } from '@nestjs/common';
import { ElasticsearchService } from '@nestjs/elasticsearch';

interface SearchBody {
  id: number;
  title: string;
  content?: string;
  authorId?: number;
}

interface SearchResult {
  hits: {
    total: number;
    hits: Array<{
      _source: SearchBody[];
    }>;
  };
}

@Injectable()
export default class SearchService {
  constructor(
    index: string,
    private readonly elasticsearchService: ElasticsearchService,
  ) {}

  async indexPost(post, index: string) {
    const { id, title, body, authorId } = post;
    return await this.elasticsearchService.index<SearchBody>({
      index,
      body: {
        id,
        title,
        content: body,
        authorId,
      },
    });
  }

  async search(text: string, index: string) {
    const fields =
      index === 'posts' ? ['title', 'content'] : ['title', 'description'];

    const result = await this.elasticsearchService.search<SearchResult>({
      index: index,
      body: {
        query: {
          multi_match: {
            query: text,
            fields,
          },
        },
      },
    });
    return result.hits.hits.map((item) => item._source);
  }

  async indexEvent(event, index: string) {
    return await this.elasticsearchService.index<SearchBody>({
      index,
      body: event,
    });
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
