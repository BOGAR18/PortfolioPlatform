CREATE TABLE IF NOT EXISTS users (
    id          SERIAL PRIMARY KEY,
    name        VARCHAR(255) NOT NULL,
    email       VARCHAR(255) NOT NULL UNIQUE,
    password    VARCHAR(255) NOT NULL,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS settings (
    key         VARCHAR(100) PRIMARY KEY,
    value       TEXT,
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS category_tech (
    id          SERIAL PRIMARY KEY,
    name        VARCHAR(255) NOT NULL,
    sort_order  INTEGER NOT NULL DEFAULT 0,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS item_tech (
    id                  SERIAL PRIMARY KEY,
    category_tech_id    INTEGER NOT NULL REFERENCES category_tech(id) ON DELETE CASCADE,
    name                VARCHAR(255) NOT NULL,
    logo                VARCHAR(255),
    sort_order          INTEGER NOT NULL DEFAULT 0,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS projects (
    id           SERIAL PRIMARY KEY,
    title        VARCHAR(255) NOT NULL,
    slug         VARCHAR(255) NOT NULL UNIQUE,
    summary      TEXT NOT NULL,
    description  TEXT,
    project_url  VARCHAR(255),
    repo_url     VARCHAR(255),
    year         SMALLINT,
    is_featured  BOOLEAN NOT NULL DEFAULT FALSE,
    sort_order   INTEGER NOT NULL DEFAULT 0,
    created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS project_images (
    id          SERIAL PRIMARY KEY,
    project_id  INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    path        VARCHAR(255) NOT NULL,
    caption     VARCHAR(255),
    sort_order  INTEGER NOT NULL DEFAULT 0,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS item_tech_project (
    project_id    INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    item_tech_id  INTEGER NOT NULL REFERENCES item_tech(id) ON DELETE CASCADE,
    PRIMARY KEY (project_id, item_tech_id)
);

CREATE TABLE IF NOT EXISTS certifications (
    id             SERIAL PRIMARY KEY,
    name           VARCHAR(255) NOT NULL,
    issuer         VARCHAR(255) NOT NULL,
    issued_at      DATE,
    expires_at     DATE,
    credential_id  VARCHAR(255),
    credential_url VARCHAR(255),
    image          VARCHAR(255),
    sort_order     INTEGER NOT NULL DEFAULT 0,
    created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS experiences (
    id           SERIAL PRIMARY KEY,
    role         VARCHAR(255) NOT NULL,
    company      VARCHAR(255) NOT NULL,
    start_year   SMALLINT NOT NULL,
    end_year     SMALLINT,
    description  TEXT,
    sort_order   INTEGER NOT NULL DEFAULT 0,
    created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
