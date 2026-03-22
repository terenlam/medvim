import { Injectable } from '@nestjs/common';
import axios from 'axios';

const RXNORM_BASE = 'https://rxnav.nlm.nih.gov/REST';

@Injectable()
export class DrugsService {
  async search(query: string) {
    if (query.length < 2) return [];

    const { data } = await axios.get(
      `${RXNORM_BASE}/drugs.json?name=${encodeURIComponent(query)}`
    );

    const groups = data?.drugGroup?.conceptGroup ?? [];
    const results = groups
      .flatMap((g: any) => g.conceptProperties ?? [])
      .map((c: any) => ({ rxcui: c.rxcui, name: c.name }))
      .slice(0, 10);

    return results;
  }
}
