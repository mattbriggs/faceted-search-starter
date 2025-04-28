import React, { useState, useEffect } from 'react';
import axios from 'axios';

function FacetedSearch() {
  const [facets, setFacets] = useState({});
  const [selectedFilters, setSelectedFilters] = useState({});
  const [results, setResults] = useState([]);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    fetchFacets();
  }, []);

  const fetchFacets = async () => {
    const response = await axios.get('/facets');
    setFacets(response.data.facets);
  };

  const fetchResults = async () => {
    const response = await axios.post('/search', {
      query: "",
      filters: selectedFilters,
      page: 1,
      pageSize: 10
    });
    setResults(response.data.results);
    setTotal(response.data.total);
  };

  const handleFilterChange = (facet, value) => {
    setSelectedFilters((prev) => {
      const newFilters = { ...prev };
      if (!newFilters[facet]) {
        newFilters[facet] = [];
      }
      if (newFilters[facet].includes(value)) {
        newFilters[facet] = newFilters[facet].filter(v => v !== value);
      } else {
        newFilters[facet].push(value);
      }
      return newFilters;
    });
  };

  useEffect(() => {
    fetchResults();
  }, [selectedFilters]);

  const clearFilters = () => {
    setSelectedFilters({});
  };

  return (
    <div>
      <h1>Faceted Search</h1>
      <div style={{ display: 'flex' }}>
        <div style={{ width: '250px' }}>
          <h2>Filters</h2>
          {Object.entries(facets).map(([facetName, values]) => (
            <div key={facetName}>
              <h3>{facetName}</h3>
              {values.map((item) => (
                <div key={item.value}>
                  <input
                    type="checkbox"
                    checked={selectedFilters[facetName]?.includes(item.value) || false}
                    onChange={() => handleFilterChange(facetName, item.value)}
                  />
                  {item.value} ({item.count})
                </div>
              ))}
            </div>
          ))}
          <button onClick={clearFilters}>Clear All Filters</button>
        </div>

        <div style={{ marginLeft: '20px', flexGrow: 1 }}>
          <h2>Results ({total})</h2>
          {results.map((doc) => (
            <div key={doc.id}>
              <h3>{doc.title}</h3>
              <p>{doc.snippet}</p>
              <p><strong>Category:</strong> {doc.category}</p>
              <p><strong>Tags:</strong> {doc.tags.join(', ')}</p>
              <hr />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default FacetedSearch;
