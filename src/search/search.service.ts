import { Injectable } from '@nestjs/common';
import { ElasticsearchService } from '@nestjs/elasticsearch';
import { SearchParams } from 'src/events/events.service';

export interface SearchBody {
  id: number;
  title?: string;
  content?: string;
  authorId?: number;
  venue?: string;
  start?: Date;
  end?: Date;
  description?: string;
}

interface SearchResult {
  hits: {
    total: number;
    hits: Array<{
      _source: SearchBody[];
    }>;
  };
}

export interface PaginatedResponse {
  items: SearchBody[];
  meta: {
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
  };
}

@Injectable()
export default class SearchService {
  constructor(private readonly elasticsearchService: ElasticsearchService) {}

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

  // need to change the return type to PaginatedResponse
  // need to separate the search logic for posts and events
  async search({
    text,
    search,
    index,
    page,
    pageSize,
  }: {
    text?: string;
    search?: SearchParams;
    index: string;
    page?: number;
    pageSize?: number;
  }) {
    if (index === 'posts') {
      const fields = ['title', 'content'];
      const result = await this.elasticsearchService.search<SearchBody>({
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
    if (index === 'events') {
      const must = [];
      if (search.keyword) {
        must.push({
          multi_match: {
            query: search.keyword,
            fields: ['title', 'description'],
          },
        });
      }
      if (search.venue) {
        must.push({
          match: {
            venue: search.venue,
          },
        });
      }
      if (search.start) {
        const range: any = {};
        if (search.start) {
          range.gte = search.start;
        }
        if (search.end) {
          range.lte = search.end;
        }
        must.push({
          range: {
            start: range,
          },
        });
      }

      const result = await this.elasticsearchService.search<PaginatedResponse>({
        index: index,
        body: {
          query: {
            bool: {
              must: must.length > 0 ? must : [{ match_all: {} }],
            },
          },
          from: (page - 1) * pageSize,
          size: pageSize,
          sort: [{ start: { order: 'asc' } }],
        },
      });
      return {
        items: result.hits.hits.map((item) => item._source),
        meta: {
          total: result.hits.total,
          page,
          pageSize,
          totalPages: Math.ceil(result.hits.total / pageSize),
        },
      };
    }
  }
}
