CREATE TABLE domain_administrators (
    admin_id integer NOT NULL,
    user_id integer NOT NULL,
    domain_id integer NOT NULL
);
CREATE SEQUENCE domain_administrators_admin_id_seq
    INCREMENT BY 1
    NO MAXVALUE
    NO MINVALUE
    CACHE 1;
ALTER SEQUENCE domain_administrators_admin_id_seq OWNED BY domain_administrators.admin_id;

CREATE TABLE local_aliases (
    alias_id integer NOT NULL,
    name character varying NOT NULL,
    destination character varying NOT NULL,
    active boolean DEFAULT false NOT NULL,
    CONSTRAINT local_aliases_destination_exists CHECK (((destination)::text <> ''::text)),
    CONSTRAINT local_aliases_name_exists CHECK (((name)::text <> ''::text))
);
CREATE SEQUENCE local_aliases_alias_id_seq
    INCREMENT BY 1
    NO MAXVALUE
    NO MINVALUE
    CACHE 1;

ALTER SEQUENCE local_aliases_alias_id_seq OWNED BY local_aliases.alias_id;

CREATE TABLE roles (
    role_id integer NOT NULL,
    role character varying NOT NULL,
    description character varying NOT NULL
);
CREATE SEQUENCE roles_role_id_seq
    INCREMENT BY 1
    NO MAXVALUE
    NO MINVALUE
    CACHE 1;
ALTER SEQUENCE roles_role_id_seq OWNED BY roles.role_id;

CREATE TABLE virtual_aliases (
    alias_id integer NOT NULL,
    username character varying NOT NULL,
    domain_id integer DEFAULT 1 NOT NULL,
    destination character varying NOT NULL,
    active boolean DEFAULT false NOT NULL,
    CONSTRAINT virtual_aliases_destination_exists CHECK (((destination)::text <> ''::text))
);
CREATE SEQUENCE virtual_aliases_alias_id_seq
    INCREMENT BY 1
    NO MAXVALUE
    NO MINVALUE
    CACHE 1;
ALTER SEQUENCE virtual_aliases_alias_id_seq OWNED BY virtual_aliases.alias_id;

CREATE TABLE virtual_domains (
    domain_id integer NOT NULL,
    domain character varying NOT NULL,
    CONSTRAINT virtual_domains_exists CHECK (((domain)::text <> ''::text))
);
CREATE SEQUENCE virtual_domains_domain_id_seq
    INCREMENT BY 1
    NO MAXVALUE
    NO MINVALUE
    CACHE 1;
ALTER SEQUENCE virtual_domains_domain_id_seq OWNED BY virtual_domains.domain_id;

CREATE TABLE virtual_users (
    user_id integer NOT NULL,
    username character varying NOT NULL,
    domain_id integer DEFAULT 1 NOT NULL,
    password character varying DEFAULT '!'::character varying NOT NULL,
    role_id integer DEFAULT 1 NOT NULL,
    description character varying,
    active boolean DEFAULT false NOT NULL,
    CONSTRAINT virtual_user_exists CHECK (((username)::text <> ''::text))
);
CREATE SEQUENCE virtual_users_user_id_seq
    INCREMENT BY 1
    NO MAXVALUE
    NO MINVALUE
    CACHE 1;
ALTER SEQUENCE virtual_users_user_id_seq OWNED BY virtual_users.user_id;

ALTER TABLE domain_administrators ALTER COLUMN admin_id SET DEFAULT nextval('domain_administrators_admin_id_seq'::regclass);
ALTER TABLE local_aliases ALTER COLUMN alias_id SET DEFAULT nextval('local_aliases_alias_id_seq'::regclass);
ALTER TABLE roles ALTER COLUMN role_id SET DEFAULT nextval('roles_role_id_seq'::regclass);
ALTER TABLE virtual_aliases ALTER COLUMN alias_id SET DEFAULT nextval('virtual_aliases_alias_id_seq'::regclass);
ALTER TABLE virtual_domains ALTER COLUMN domain_id SET DEFAULT nextval('virtual_domains_domain_id_seq'::regclass);
ALTER TABLE virtual_users ALTER COLUMN user_id SET DEFAULT nextval('virtual_users_user_id_seq'::regclass);
ALTER TABLE ONLY domain_administrators
    ADD CONSTRAINT domain_administrators_pkey PRIMARY KEY (admin_id);
ALTER TABLE ONLY virtual_users
    ADD CONSTRAINT email_address UNIQUE (username, domain_id);
ALTER TABLE ONLY local_aliases
    ADD CONSTRAINT local_aliases_pkey PRIMARY KEY (alias_id);
ALTER TABLE ONLY local_aliases
    ADD CONSTRAINT local_aliases_unique_alias UNIQUE (name, destination);
ALTER TABLE ONLY roles
    ADD CONSTRAINT roles_pkey PRIMARY KEY (role_id);
ALTER TABLE ONLY virtual_aliases
    ADD CONSTRAINT unique_alias UNIQUE (username, domain_id, destination);
ALTER TABLE ONLY virtual_domains
    ADD CONSTRAINT unique_domain UNIQUE (domain);
ALTER TABLE ONLY domain_administrators
    ADD CONSTRAINT unique_domain_administrator UNIQUE (user_id, domain_id);
ALTER TABLE ONLY roles
    ADD CONSTRAINT unique_role UNIQUE (role, description);
ALTER TABLE ONLY virtual_aliases
    ADD CONSTRAINT virtual_aliases_pkey PRIMARY KEY (alias_id);
ALTER TABLE ONLY virtual_domains
    ADD CONSTRAINT virtual_domains_pkey PRIMARY KEY (domain_id);
ALTER TABLE ONLY virtual_users
    ADD CONSTRAINT virtual_users_pkey PRIMARY KEY (user_id);
CREATE INDEX local_aliases_name ON local_aliases USING btree (name);
ALTER TABLE ONLY domain_administrators
    ADD CONSTRAINT domain_administrators_domain_id_fkey FOREIGN KEY (domain_id) REFERENCES virtual_domains(domain_id) ON UPDATE CASCADE ON DELETE CASCADE;
ALTER TABLE ONLY domain_administrators
    ADD CONSTRAINT domain_administrators_user_id_fkey FOREIGN KEY (user_id) REFERENCES virtual_users(user_id) ON UPDATE CASCADE ON DELETE CASCADE;
ALTER TABLE ONLY virtual_aliases
    ADD CONSTRAINT virtual_aliases_domain_id_fkey FOREIGN KEY (domain_id) REFERENCES virtual_domains(domain_id) ON UPDATE CASCADE ON DELETE CASCADE;
ALTER TABLE ONLY virtual_users
    ADD CONSTRAINT virtual_users_domain_id_fkey FOREIGN KEY (domain_id) REFERENCES virtual_domains(domain_id) ON UPDATE CASCADE ON DELETE CASCADE;
ALTER TABLE ONLY virtual_users
    ADD CONSTRAINT virtual_users_role_id_fkey FOREIGN KEY (role_id) REFERENCES roles(role_id) ON UPDATE CASCADE ON DELETE SET DEFAULT;

