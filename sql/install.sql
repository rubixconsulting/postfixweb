CREATE TABLE sender_access (
    access_id serial NOT NULL,
    pattern character varying NOT NULL,
    access_action_id integer NOT NULL,
    active boolean DEFAULT false NOT NULL,
    CONSTRAINT access_pattern_exists CHECK (((pattern)::text <> ''::text))
);

CREATE TABLE sender_access_actions (
    access_action_id serial NOT NULL,
    action character varying NOT NULL,
    description character varying NOT NULL,
    CONSTRAINT action_name_exists CHECK (((action)::text <> ''::text))
);

CREATE TABLE autoreply (
    user_id integer NOT NULL,
    begins date DEFAULT now() NOT NULL,
    ends date,
    message character varying NOT NULL,
    active boolean DEFAULT false NOT NULL,
    CONSTRAINT autoreply_message_exists CHECK (((message)::text <> ''::text))
);

CREATE TABLE autoreply_log (
    user_id integer NOT NULL,
    from_email character varying NOT NULL,
    "timestamp" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE domain_administrators (
    admin_id serial NOT NULL,
    user_id integer NOT NULL,
    domain_id integer NOT NULL
);

CREATE TABLE local_aliases (
    alias_id serial NOT NULL,
    name character varying NOT NULL,
    destination character varying NOT NULL,
    active boolean DEFAULT false NOT NULL,
    CONSTRAINT local_aliases_destination_exists CHECK (((destination)::text <> ''::text)),
    CONSTRAINT local_aliases_name_exists CHECK (((name)::text <> ''::text))
);

CREATE TABLE recipient_access (
    access_id serial NOT NULL,
    pattern character varying NOT NULL,
    action character varying NOT NULL,
    active boolean DEFAULT false NOT NULL,
    CONSTRAINT recipient_access_pattern_exists CHECK (((pattern)::text <> ''::text))
);

CREATE TABLE roles (
    role_id serial NOT NULL,
    role character varying NOT NULL,
    description character varying NOT NULL
);

CREATE TABLE transport_maps (
    transport_id serial NOT NULL,
    subdomain character varying DEFAULT ''::character varying NOT NULL,
    domain_id integer DEFAULT 1 NOT NULL,
    destination character varying NOT NULL,
    active boolean DEFAULT false NOT NULL,
    CONSTRAINT transport_maps_destination_exists CHECK (((destination)::text <> ''::text))
);

CREATE TABLE virtual_aliases (
    alias_id serial NOT NULL,
    username character varying NOT NULL,
    domain_id integer DEFAULT 1 NOT NULL,
    destination character varying NOT NULL,
    active boolean DEFAULT false NOT NULL,
    CONSTRAINT virtual_aliases_destination_exists CHECK (((destination)::text <> ''::text))
);

CREATE TABLE virtual_domains (
    domain_id serial NOT NULL,
    domain character varying NOT NULL,
    CONSTRAINT virtual_domains_exists CHECK (((domain)::text <> ''::text))
);

CREATE TABLE virtual_users (
    user_id serial NOT NULL,
    username character varying NOT NULL,
    domain_id integer DEFAULT 1 NOT NULL,
    password character varying DEFAULT '!'::character varying NOT NULL,
    role_id integer DEFAULT 1 NOT NULL,
    description character varying,
    active boolean DEFAULT false NOT NULL,
    CONSTRAINT virtual_user_exists CHECK (((username)::text <> ''::text))
);

ALTER TABLE ONLY sender_access_actions
    ADD CONSTRAINT access_actions_action_name_key UNIQUE (action);

ALTER TABLE ONLY sender_access_actions
    ADD CONSTRAINT access_actions_pkey PRIMARY KEY (access_action_id);

ALTER TABLE ONLY sender_access
    ADD CONSTRAINT access_pkey PRIMARY KEY (access_id);

ALTER TABLE ONLY autoreply_log
    ADD CONSTRAINT autoreply_log_pkey PRIMARY KEY (user_id, from_email);

ALTER TABLE ONLY autoreply
    ADD CONSTRAINT autoreply_pkey PRIMARY KEY (user_id);

ALTER TABLE ONLY domain_administrators
    ADD CONSTRAINT domain_administrators_pkey PRIMARY KEY (admin_id);

ALTER TABLE ONLY virtual_users
    ADD CONSTRAINT email_address UNIQUE (username, domain_id);

ALTER TABLE ONLY local_aliases
    ADD CONSTRAINT local_aliases_pkey PRIMARY KEY (alias_id);

ALTER TABLE ONLY local_aliases
    ADD CONSTRAINT local_aliases_unique_alias UNIQUE (name, destination);

ALTER TABLE ONLY recipient_access
    ADD CONSTRAINT recipient_access_pkey PRIMARY KEY (access_id);

ALTER TABLE ONLY roles
    ADD CONSTRAINT roles_pkey PRIMARY KEY (role_id);

ALTER TABLE ONLY transport_maps
    ADD CONSTRAINT transport_maps_pkey PRIMARY KEY (transport_id);

ALTER TABLE ONLY virtual_aliases
    ADD CONSTRAINT unique_alias UNIQUE (username, domain_id, destination);

ALTER TABLE ONLY virtual_domains
    ADD CONSTRAINT unique_domain UNIQUE (domain);

ALTER TABLE ONLY domain_administrators
    ADD CONSTRAINT unique_domain_administrator UNIQUE (user_id, domain_id);

ALTER TABLE ONLY roles
    ADD CONSTRAINT unique_role UNIQUE (role, description);

ALTER TABLE ONLY transport_maps
    ADD CONSTRAINT unique_transport UNIQUE (subdomain, domain_id, destination);

ALTER TABLE ONLY virtual_aliases
    ADD CONSTRAINT virtual_aliases_pkey PRIMARY KEY (alias_id);

ALTER TABLE ONLY virtual_domains
    ADD CONSTRAINT virtual_domains_pkey PRIMARY KEY (domain_id);

ALTER TABLE ONLY virtual_users
    ADD CONSTRAINT virtual_users_pkey PRIMARY KEY (user_id);

CREATE INDEX access_pattern ON sender_access USING btree (pattern);
CREATE INDEX local_aliases_name ON local_aliases USING btree (name);
CREATE UNIQUE INDEX recipient_access_patern_unique ON recipient_access USING btree (pattern);
CREATE INDEX recipient_access_pattern ON recipient_access USING btree (pattern);
CREATE UNIQUE INDEX sender_access_pattern_unique ON sender_access USING btree (pattern);

ALTER TABLE ONLY sender_access
    ADD CONSTRAINT access_access_action_id_fkey FOREIGN KEY (access_action_id) REFERENCES sender_access_actions(access_action_id) ON UPDATE CASCADE ON DELETE CASCADE;

ALTER TABLE ONLY autoreply_log
    ADD CONSTRAINT autoreply_log_user_id_fkey FOREIGN KEY (user_id) REFERENCES virtual_users(user_id) ON UPDATE CASCADE ON DELETE CASCADE;

ALTER TABLE ONLY autoreply
    ADD CONSTRAINT autoreply_user_id_fkey FOREIGN KEY (user_id) REFERENCES virtual_users(user_id) ON UPDATE CASCADE ON DELETE CASCADE;

ALTER TABLE ONLY domain_administrators
    ADD CONSTRAINT domain_administrators_domain_id_fkey FOREIGN KEY (domain_id) REFERENCES virtual_domains(domain_id) ON UPDATE CASCADE ON DELETE CASCADE;

ALTER TABLE ONLY domain_administrators
    ADD CONSTRAINT domain_administrators_user_id_fkey FOREIGN KEY (user_id) REFERENCES virtual_users(user_id) ON UPDATE CASCADE ON DELETE CASCADE;

ALTER TABLE ONLY transport_maps
    ADD CONSTRAINT transport_maps_domain_id_fkey FOREIGN KEY (domain_id) REFERENCES virtual_domains(domain_id) ON UPDATE CASCADE ON DELETE CASCADE;

ALTER TABLE ONLY virtual_aliases
    ADD CONSTRAINT virtual_aliases_domain_id_fkey FOREIGN KEY (domain_id) REFERENCES virtual_domains(domain_id) ON UPDATE CASCADE ON DELETE CASCADE;

ALTER TABLE ONLY virtual_users
    ADD CONSTRAINT virtual_users_domain_id_fkey FOREIGN KEY (domain_id) REFERENCES virtual_domains(domain_id) ON UPDATE CASCADE ON DELETE CASCADE;

ALTER TABLE ONLY virtual_users
    ADD CONSTRAINT virtual_users_role_id_fkey FOREIGN KEY (role_id) REFERENCES roles(role_id) ON UPDATE CASCADE ON DELETE SET DEFAULT;

INSERT INTO roles (role, description) VALUES('undef', 'Undefined User');
INSERT INTO roles (role, description) VALUES('user',  'Email User');
INSERT INTO roles (role, description) VALUES('admin', 'Site Administrator and Email User');

INSERT INTO sender_access_actions (action, description) VALUES('OK',      'Accept the address etc. that matches the pattern.');
INSERT INTO sender_access_actions (action, description) VALUES('REJECT',  'Reject the address etc. that matches the pattern.');
INSERT INTO sender_access_actions (action, description) VALUES('DISCARD', 'Claim successful delivery and silently discard the message.');
INSERT INTO sender_access_actions (action, description) VALUES('DUNNO',   'Pretend that the lookup key was not found.');
INSERT INTO sender_access_actions (action, description) VALUES('HOLD',    'Place the message on the hold queue, where it will sit until someone either deletes it or releases it for delivery.');
