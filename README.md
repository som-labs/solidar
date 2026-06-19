# Solidar

Optimize the size of roof solar panel installations

## About Solidar

Solidar is a calculator to find out the optimal number of solar panels
to install on the roof of a building,
given the features of the roof and the energy use of the residents.

It takes data like the dimensions of the roof, its tilt and orientaion,
the energy use and the electric fare,
and, then, generates a report with the proposed a number of panels,
their economic cost and estimations the eventual savings.

## Copying

This software is licensed under a GNU Affero Licence 3.0 or later.
A short non-binding summary is that
you have the right to **use, modify and distribute** it
with no warranty
as long as you grant the **same rights to the users**
you redistribute to, including your modifications
and considering **online use as redistribution**.

[Full binding version of the License](LICENSE)

## Setup

```bash
git clone git@github.com:som-labs/solidar.git
cd solidar
npm install
npm run dev
```

## Mapbox token

Satellite map depends on availability or not of Mapbox token.
If you want to have it go to https://www.mapbox.com/ and get token for Static Tiles API, is free with a limit of 200.000 tiles
Create file .env and insert line:
VITE_MAPBOX_TOKEN="your Mapbox token"
If no Mapbox tokken available solidar will use ArcGIS Online World Imagery from https://www.arcgis.com

## Contributing

Take a look at the [Contribution guide](CONTRIB.md)
