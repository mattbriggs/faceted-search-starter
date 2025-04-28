from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List, Optional
import meilisearch

app = FastAPI()

client = meilisearch.Client('http://meilisearch:7700', 'supersecureapikey')
index = client.index('documents')

class SearchFilters(BaseModel):
    query: Optional[str] = None
    filters: Optional[dict] = None
    page: Optional[int] = 1
    pageSize: Optional[int] = 10

@app.get("/facets")
def get_facets():
    response = index.search(
        "",
        {
            "facetsDistribution": ["category", "tags", "status", "publishYear"],
            "limit": 0
        }
    )
    return {"facets": response.get("facetsDistribution", {})}

@app.post("/search")
def search_documents(filters: SearchFilters):
    filter_clauses = []
    if filters.filters:
        for key, values in filters.filters.items():
            clauses = [f'{key} = "{v}"' for v in values]
            filter_clauses.append(f'({" OR ".join(clauses)})')

    filter_string = " AND ".join(filter_clauses) if filter_clauses else None

    offset = (filters.page - 1) * filters.pageSize

    response = index.search(
        filters.query or "",
        {
            "filter": filter_string,
            "offset": offset,
            "limit": filters.pageSize
        }
    )

    return {
        "results": response.get("hits", []),
        "total": response.get("estimatedTotalHits", 0)
    }
