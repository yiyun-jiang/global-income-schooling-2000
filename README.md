I used AI in this assignment for debugging and interface design exploration. I did not use AI to write or complete any components where AI use is prohibited, and I am able to explain how my code works.

# Global Income & Schooling Dashboard (2000)
This smart dashboard visualizes global average income (in USD converted by 2024 rate) and average years of schooling (for adults) in 2000 using interactive choropleth maps. Use the buttons above to switch between income and schooling layers.

## Live Dashboard URL
https://yiyun-jiang.github.io/global-income-schooling-2000/

## Dashboard Features 
- Two thematic layers: **Income** and **Schooling**
- Gray color for **No Data** countries
- Click to see pop-ups and bar chart on the side
- Reset button to return to the default view 
- Legend that updates based on the active layer

## Why Choropleth?
Because both income and schooling are country‑level data, creating choropleth layers makes it easy to see regional patterns, compare different parts of the globe, and quickly see where values are higher or lower.

## Data Sources
- [World country boundaries (GeoJSON)](https://hub.arcgis.com/datasets/esri::world-countries-generalized)
- [Average years of schooling among adults](https://ourworldindata.org/grapher/years-of-schooling)
- [Adjusted net national income per capita (current US$)](https://data.worldbank.org/indicator/NY.ADJ.NNTY.PC.CD)
