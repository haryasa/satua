-- Migration number: 0001 	 2024-04-13T05:25:48.136Z
CREATE TABLE story (
    id UUID PRIMARY KEY,
    keywords TEXT,
    genre VARCHAR(255),
    theme VARCHAR(255),
    title VARCHAR(255),
    synopsis TEXT,
    tone VARCHAR(255),
    setting TEXT,
    characters TEXT,
    pointOfView VARCHAR(255),
    illustrationUrl TEXT NULL
);
