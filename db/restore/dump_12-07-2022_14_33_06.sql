--
-- PostgreSQL database cluster dump
--

SET default_transaction_read_only = off;

SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;

--
-- Create/update roles
--


ALTER ROLE postgres WITH SUPERUSER INHERIT CREATEROLE CREATEDB LOGIN REPLICATION BYPASSRLS;

--
-- Create DD role: https://docs.datadoghq.com/integrations/postgres/?tab=host#configuration
--

create user datadog with password 'datadog';
grant pg_monitor to datadog;
grant SELECT ON pg_stat_database to datadog;

--
-- Databases
--

--
-- Database "template1" dump
--

--
-- PostgreSQL database dump
--

-- Dumped from database version 13.7
-- Dumped by pg_dump version 13.7

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

UPDATE pg_catalog.pg_database SET datistemplate = false WHERE datname = 'template1';
DROP DATABASE template1;
--
-- Name: template1; Type: DATABASE; Schema: -; Owner: postgres
--

CREATE DATABASE template1 WITH TEMPLATE = template0 ENCODING = 'UTF8' LOCALE = 'en_US.utf8';


ALTER DATABASE template1 OWNER TO postgres;

\connect template1

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: DATABASE template1; Type: COMMENT; Schema: -; Owner: postgres
--

COMMENT ON DATABASE template1 IS 'default template for new databases';


--
-- Name: template1; Type: DATABASE PROPERTIES; Schema: -; Owner: postgres
--

ALTER DATABASE template1 IS_TEMPLATE = true;


\connect template1

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: DATABASE template1; Type: ACL; Schema: -; Owner: postgres
--

REVOKE CONNECT,TEMPORARY ON DATABASE template1 FROM PUBLIC;
GRANT CONNECT ON DATABASE template1 TO PUBLIC;


--
-- PostgreSQL database dump complete
--

--
-- Database "postgres" dump
--

--
-- PostgreSQL database dump
--

-- Dumped from database version 13.7
-- Dumped by pg_dump version 13.7

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

DROP DATABASE postgres;
--
-- Name: postgres; Type: DATABASE; Schema: -; Owner: postgres
--

CREATE DATABASE postgres WITH TEMPLATE = template0 ENCODING = 'UTF8' LOCALE = 'en_US.utf8';


ALTER DATABASE postgres OWNER TO postgres;

\connect postgres

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: DATABASE postgres; Type: COMMENT; Schema: -; Owner: postgres
--

COMMENT ON DATABASE postgres IS 'default administrative connection database';


--
-- PostgreSQL database dump complete
--

--
-- Database "spree_starter_development" dump
--

--
-- PostgreSQL database dump
--

-- Dumped from database version 13.7
-- Dumped by pg_dump version 13.7

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: spree_starter_development; Type: DATABASE; Schema: -; Owner: postgres
--

CREATE DATABASE spree_starter_development WITH TEMPLATE = template0 ENCODING = 'UTF8' LOCALE = 'en_US.utf8';


ALTER DATABASE spree_starter_development OWNER TO postgres;

\connect spree_starter_development

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: action_mailbox_inbound_emails; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.action_mailbox_inbound_emails (
    id bigint NOT NULL,
    status integer DEFAULT 0 NOT NULL,
    message_id character varying NOT NULL,
    message_checksum character varying NOT NULL,
    created_at timestamp(6) without time zone NOT NULL,
    updated_at timestamp(6) without time zone NOT NULL
);


ALTER TABLE public.action_mailbox_inbound_emails OWNER TO postgres;

--
-- Name: action_mailbox_inbound_emails_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.action_mailbox_inbound_emails_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.action_mailbox_inbound_emails_id_seq OWNER TO postgres;

--
-- Name: action_mailbox_inbound_emails_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.action_mailbox_inbound_emails_id_seq OWNED BY public.action_mailbox_inbound_emails.id;


--
-- Name: action_text_rich_texts; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.action_text_rich_texts (
    id bigint NOT NULL,
    name character varying NOT NULL,
    body text,
    record_type character varying NOT NULL,
    record_id bigint NOT NULL,
    created_at timestamp(6) without time zone NOT NULL,
    updated_at timestamp(6) without time zone NOT NULL
);


ALTER TABLE public.action_text_rich_texts OWNER TO postgres;

--
-- Name: action_text_rich_texts_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.action_text_rich_texts_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.action_text_rich_texts_id_seq OWNER TO postgres;

--
-- Name: action_text_rich_texts_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.action_text_rich_texts_id_seq OWNED BY public.action_text_rich_texts.id;


--
-- Name: active_storage_attachments; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.active_storage_attachments (
    id bigint NOT NULL,
    name character varying NOT NULL,
    record_type character varying NOT NULL,
    record_id bigint NOT NULL,
    blob_id bigint NOT NULL,
    created_at timestamp without time zone NOT NULL
);


ALTER TABLE public.active_storage_attachments OWNER TO postgres;

--
-- Name: active_storage_attachments_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.active_storage_attachments_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.active_storage_attachments_id_seq OWNER TO postgres;

--
-- Name: active_storage_attachments_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.active_storage_attachments_id_seq OWNED BY public.active_storage_attachments.id;


--
-- Name: active_storage_blobs; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.active_storage_blobs (
    id bigint NOT NULL,
    key character varying NOT NULL,
    filename character varying NOT NULL,
    content_type character varying,
    metadata text,
    service_name character varying NOT NULL,
    byte_size bigint NOT NULL,
    checksum character varying NOT NULL,
    created_at timestamp without time zone NOT NULL
);


ALTER TABLE public.active_storage_blobs OWNER TO postgres;

--
-- Name: active_storage_blobs_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.active_storage_blobs_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.active_storage_blobs_id_seq OWNER TO postgres;

--
-- Name: active_storage_blobs_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.active_storage_blobs_id_seq OWNED BY public.active_storage_blobs.id;


--
-- Name: active_storage_variant_records; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.active_storage_variant_records (
    id bigint NOT NULL,
    blob_id bigint NOT NULL,
    variation_digest character varying NOT NULL
);


ALTER TABLE public.active_storage_variant_records OWNER TO postgres;

--
-- Name: active_storage_variant_records_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.active_storage_variant_records_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.active_storage_variant_records_id_seq OWNER TO postgres;

--
-- Name: active_storage_variant_records_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.active_storage_variant_records_id_seq OWNED BY public.active_storage_variant_records.id;


--
-- Name: ar_internal_metadata; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.ar_internal_metadata (
    key character varying NOT NULL,
    value character varying,
    created_at timestamp(6) without time zone NOT NULL,
    updated_at timestamp(6) without time zone NOT NULL
);


ALTER TABLE public.ar_internal_metadata OWNER TO postgres;

--
-- Name: friendly_id_slugs; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.friendly_id_slugs (
    id bigint NOT NULL,
    slug character varying NOT NULL,
    sluggable_id bigint NOT NULL,
    sluggable_type character varying(50),
    scope character varying,
    created_at timestamp without time zone,
    deleted_at timestamp without time zone
);


ALTER TABLE public.friendly_id_slugs OWNER TO postgres;

--
-- Name: friendly_id_slugs_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.friendly_id_slugs_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.friendly_id_slugs_id_seq OWNER TO postgres;

--
-- Name: friendly_id_slugs_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.friendly_id_slugs_id_seq OWNED BY public.friendly_id_slugs.id;


--
-- Name: schema_migrations; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.schema_migrations (
    version character varying NOT NULL
);


ALTER TABLE public.schema_migrations OWNER TO postgres;

--
-- Name: spree_addresses; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.spree_addresses (
    id bigint NOT NULL,
    firstname character varying,
    lastname character varying,
    address1 character varying,
    address2 character varying,
    city character varying,
    zipcode character varying,
    phone character varying,
    state_name character varying,
    alternative_phone character varying,
    company character varying,
    state_id bigint,
    country_id bigint,
    created_at timestamp(6) without time zone NOT NULL,
    updated_at timestamp(6) without time zone NOT NULL,
    user_id bigint,
    deleted_at timestamp without time zone,
    label character varying,
    public_metadata jsonb,
    private_metadata jsonb
);


ALTER TABLE public.spree_addresses OWNER TO postgres;

--
-- Name: spree_addresses_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.spree_addresses_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.spree_addresses_id_seq OWNER TO postgres;

--
-- Name: spree_addresses_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.spree_addresses_id_seq OWNED BY public.spree_addresses.id;


--
-- Name: spree_adjustments; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.spree_adjustments (
    id bigint NOT NULL,
    source_type character varying,
    source_id bigint,
    adjustable_type character varying,
    adjustable_id bigint,
    amount numeric(10,2),
    label character varying,
    mandatory boolean,
    eligible boolean DEFAULT true,
    created_at timestamp(6) without time zone NOT NULL,
    updated_at timestamp(6) without time zone NOT NULL,
    state character varying,
    order_id bigint NOT NULL,
    included boolean DEFAULT false
);


ALTER TABLE public.spree_adjustments OWNER TO postgres;

--
-- Name: spree_adjustments_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.spree_adjustments_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.spree_adjustments_id_seq OWNER TO postgres;

--
-- Name: spree_adjustments_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.spree_adjustments_id_seq OWNED BY public.spree_adjustments.id;


--
-- Name: spree_assets; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.spree_assets (
    id bigint NOT NULL,
    viewable_type character varying,
    viewable_id bigint,
    attachment_width integer,
    attachment_height integer,
    attachment_file_size integer,
    "position" integer,
    attachment_content_type character varying,
    attachment_file_name character varying,
    type character varying(75),
    attachment_updated_at timestamp without time zone,
    alt text,
    created_at timestamp without time zone,
    updated_at timestamp without time zone,
    public_metadata jsonb,
    private_metadata jsonb
);


ALTER TABLE public.spree_assets OWNER TO postgres;

--
-- Name: spree_assets_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.spree_assets_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.spree_assets_id_seq OWNER TO postgres;

--
-- Name: spree_assets_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.spree_assets_id_seq OWNED BY public.spree_assets.id;


--
-- Name: spree_calculators; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.spree_calculators (
    id bigint NOT NULL,
    type character varying,
    calculable_type character varying,
    calculable_id bigint,
    created_at timestamp(6) without time zone NOT NULL,
    updated_at timestamp(6) without time zone NOT NULL,
    preferences text,
    deleted_at timestamp without time zone
);


ALTER TABLE public.spree_calculators OWNER TO postgres;

--
-- Name: spree_calculators_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.spree_calculators_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.spree_calculators_id_seq OWNER TO postgres;

--
-- Name: spree_calculators_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.spree_calculators_id_seq OWNED BY public.spree_calculators.id;


--
-- Name: spree_checks; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.spree_checks (
    id bigint NOT NULL,
    payment_method_id bigint,
    user_id bigint,
    account_holder_name character varying,
    account_holder_type character varying,
    routing_number character varying,
    account_number character varying,
    account_type character varying DEFAULT 'checking'::character varying,
    status character varying,
    last_digits character varying,
    gateway_customer_profile_id character varying,
    gateway_payment_profile_id character varying,
    created_at timestamp without time zone NOT NULL,
    updated_at timestamp without time zone NOT NULL,
    deleted_at timestamp without time zone
);


ALTER TABLE public.spree_checks OWNER TO postgres;

--
-- Name: spree_checks_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.spree_checks_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.spree_checks_id_seq OWNER TO postgres;

--
-- Name: spree_checks_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.spree_checks_id_seq OWNED BY public.spree_checks.id;


--
-- Name: spree_cms_pages; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.spree_cms_pages (
    id bigint NOT NULL,
    title character varying NOT NULL,
    meta_title character varying,
    content text,
    meta_description text,
    visible boolean DEFAULT true,
    slug character varying,
    type character varying,
    locale character varying,
    deleted_at timestamp without time zone,
    store_id bigint,
    created_at timestamp without time zone NOT NULL,
    updated_at timestamp without time zone NOT NULL
);


ALTER TABLE public.spree_cms_pages OWNER TO postgres;

--
-- Name: spree_cms_pages_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.spree_cms_pages_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.spree_cms_pages_id_seq OWNER TO postgres;

--
-- Name: spree_cms_pages_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.spree_cms_pages_id_seq OWNED BY public.spree_cms_pages.id;


--
-- Name: spree_cms_sections; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.spree_cms_sections (
    id bigint NOT NULL,
    name character varying NOT NULL,
    content text,
    settings text,
    fit character varying,
    destination character varying,
    type character varying,
    "position" integer,
    linked_resource_type character varying,
    linked_resource_id bigint,
    cms_page_id bigint,
    created_at timestamp without time zone NOT NULL,
    updated_at timestamp without time zone NOT NULL
);


ALTER TABLE public.spree_cms_sections OWNER TO postgres;

--
-- Name: spree_cms_sections_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.spree_cms_sections_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.spree_cms_sections_id_seq OWNER TO postgres;

--
-- Name: spree_cms_sections_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.spree_cms_sections_id_seq OWNED BY public.spree_cms_sections.id;


--
-- Name: spree_countries; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.spree_countries (
    id bigint NOT NULL,
    iso_name character varying,
    iso character varying NOT NULL,
    iso3 character varying NOT NULL,
    name character varying,
    numcode integer,
    states_required boolean DEFAULT false,
    updated_at timestamp without time zone,
    zipcode_required boolean DEFAULT true,
    created_at timestamp without time zone
);


ALTER TABLE public.spree_countries OWNER TO postgres;

--
-- Name: spree_countries_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.spree_countries_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.spree_countries_id_seq OWNER TO postgres;

--
-- Name: spree_countries_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.spree_countries_id_seq OWNED BY public.spree_countries.id;


--
-- Name: spree_credit_cards; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.spree_credit_cards (
    id bigint NOT NULL,
    month character varying,
    year character varying,
    cc_type character varying,
    last_digits character varying,
    address_id bigint,
    gateway_customer_profile_id character varying,
    gateway_payment_profile_id character varying,
    created_at timestamp(6) without time zone NOT NULL,
    updated_at timestamp(6) without time zone NOT NULL,
    name character varying,
    user_id bigint,
    payment_method_id bigint,
    "default" boolean DEFAULT false NOT NULL,
    deleted_at timestamp without time zone,
    public_metadata jsonb,
    private_metadata jsonb
);


ALTER TABLE public.spree_credit_cards OWNER TO postgres;

--
-- Name: spree_credit_cards_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.spree_credit_cards_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.spree_credit_cards_id_seq OWNER TO postgres;

--
-- Name: spree_credit_cards_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.spree_credit_cards_id_seq OWNED BY public.spree_credit_cards.id;


--
-- Name: spree_customer_returns; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.spree_customer_returns (
    id bigint NOT NULL,
    number character varying,
    stock_location_id bigint,
    created_at timestamp(6) without time zone NOT NULL,
    updated_at timestamp(6) without time zone NOT NULL,
    store_id bigint,
    public_metadata jsonb,
    private_metadata jsonb
);


ALTER TABLE public.spree_customer_returns OWNER TO postgres;

--
-- Name: spree_customer_returns_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.spree_customer_returns_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.spree_customer_returns_id_seq OWNER TO postgres;

--
-- Name: spree_customer_returns_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.spree_customer_returns_id_seq OWNED BY public.spree_customer_returns.id;


--
-- Name: spree_digital_links; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.spree_digital_links (
    id bigint NOT NULL,
    digital_id bigint,
    line_item_id bigint,
    token character varying,
    access_counter integer,
    created_at timestamp without time zone NOT NULL,
    updated_at timestamp without time zone NOT NULL
);


ALTER TABLE public.spree_digital_links OWNER TO postgres;

--
-- Name: spree_digital_links_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.spree_digital_links_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.spree_digital_links_id_seq OWNER TO postgres;

--
-- Name: spree_digital_links_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.spree_digital_links_id_seq OWNED BY public.spree_digital_links.id;


--
-- Name: spree_digitals; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.spree_digitals (
    id bigint NOT NULL,
    variant_id bigint,
    created_at timestamp without time zone NOT NULL,
    updated_at timestamp without time zone NOT NULL
);


ALTER TABLE public.spree_digitals OWNER TO postgres;

--
-- Name: spree_digitals_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.spree_digitals_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.spree_digitals_id_seq OWNER TO postgres;

--
-- Name: spree_digitals_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.spree_digitals_id_seq OWNED BY public.spree_digitals.id;


--
-- Name: spree_gateways; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.spree_gateways (
    id bigint NOT NULL,
    type character varying,
    name character varying,
    description text,
    active boolean DEFAULT true,
    environment character varying DEFAULT 'development'::character varying,
    server character varying DEFAULT 'test'::character varying,
    test_mode boolean DEFAULT true,
    created_at timestamp(6) without time zone NOT NULL,
    updated_at timestamp(6) without time zone NOT NULL,
    preferences text
);


ALTER TABLE public.spree_gateways OWNER TO postgres;

--
-- Name: spree_gateways_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.spree_gateways_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.spree_gateways_id_seq OWNER TO postgres;

--
-- Name: spree_gateways_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.spree_gateways_id_seq OWNED BY public.spree_gateways.id;


--
-- Name: spree_inventory_units; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.spree_inventory_units (
    id bigint NOT NULL,
    state character varying,
    variant_id bigint,
    order_id bigint,
    shipment_id bigint,
    created_at timestamp(6) without time zone NOT NULL,
    updated_at timestamp(6) without time zone NOT NULL,
    pending boolean DEFAULT true,
    line_item_id bigint,
    quantity integer DEFAULT 1,
    original_return_item_id bigint
);


ALTER TABLE public.spree_inventory_units OWNER TO postgres;

--
-- Name: spree_inventory_units_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.spree_inventory_units_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.spree_inventory_units_id_seq OWNER TO postgres;

--
-- Name: spree_inventory_units_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.spree_inventory_units_id_seq OWNED BY public.spree_inventory_units.id;


--
-- Name: spree_line_items; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.spree_line_items (
    id bigint NOT NULL,
    variant_id bigint,
    order_id bigint,
    quantity integer NOT NULL,
    price numeric(10,2) NOT NULL,
    created_at timestamp(6) without time zone NOT NULL,
    updated_at timestamp(6) without time zone NOT NULL,
    currency character varying,
    cost_price numeric(10,2),
    tax_category_id bigint,
    adjustment_total numeric(10,2) DEFAULT 0.0,
    additional_tax_total numeric(10,2) DEFAULT 0.0,
    promo_total numeric(10,2) DEFAULT 0.0,
    included_tax_total numeric(10,2) DEFAULT 0.0 NOT NULL,
    pre_tax_amount numeric(12,4) DEFAULT 0.0 NOT NULL,
    taxable_adjustment_total numeric(10,2) DEFAULT 0.0 NOT NULL,
    non_taxable_adjustment_total numeric(10,2) DEFAULT 0.0 NOT NULL,
    public_metadata jsonb,
    private_metadata jsonb
);


ALTER TABLE public.spree_line_items OWNER TO postgres;

--
-- Name: spree_line_items_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.spree_line_items_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.spree_line_items_id_seq OWNER TO postgres;

--
-- Name: spree_line_items_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.spree_line_items_id_seq OWNED BY public.spree_line_items.id;


--
-- Name: spree_log_entries; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.spree_log_entries (
    id bigint NOT NULL,
    source_type character varying,
    source_id bigint,
    details text,
    created_at timestamp(6) without time zone NOT NULL,
    updated_at timestamp(6) without time zone NOT NULL
);


ALTER TABLE public.spree_log_entries OWNER TO postgres;

--
-- Name: spree_log_entries_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.spree_log_entries_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.spree_log_entries_id_seq OWNER TO postgres;

--
-- Name: spree_log_entries_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.spree_log_entries_id_seq OWNED BY public.spree_log_entries.id;


--
-- Name: spree_menu_items; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.spree_menu_items (
    id bigint NOT NULL,
    name character varying NOT NULL,
    subtitle character varying,
    destination character varying,
    new_window boolean DEFAULT false,
    item_type character varying,
    linked_resource_type character varying DEFAULT 'URL'::character varying,
    linked_resource_id bigint,
    code character varying,
    parent_id bigint,
    lft bigint NOT NULL,
    rgt bigint NOT NULL,
    depth integer DEFAULT 0 NOT NULL,
    menu_id bigint,
    created_at timestamp without time zone NOT NULL,
    updated_at timestamp without time zone NOT NULL
);


ALTER TABLE public.spree_menu_items OWNER TO postgres;

--
-- Name: spree_menu_items_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.spree_menu_items_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.spree_menu_items_id_seq OWNER TO postgres;

--
-- Name: spree_menu_items_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.spree_menu_items_id_seq OWNED BY public.spree_menu_items.id;


--
-- Name: spree_menus; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.spree_menus (
    id bigint NOT NULL,
    name character varying,
    location character varying,
    locale character varying,
    store_id bigint,
    created_at timestamp without time zone NOT NULL,
    updated_at timestamp without time zone NOT NULL
);


ALTER TABLE public.spree_menus OWNER TO postgres;

--
-- Name: spree_menus_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.spree_menus_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.spree_menus_id_seq OWNER TO postgres;

--
-- Name: spree_menus_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.spree_menus_id_seq OWNED BY public.spree_menus.id;


--
-- Name: spree_oauth_access_grants; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.spree_oauth_access_grants (
    id bigint NOT NULL,
    resource_owner_id bigint NOT NULL,
    application_id bigint NOT NULL,
    token character varying NOT NULL,
    expires_in integer NOT NULL,
    redirect_uri text NOT NULL,
    created_at timestamp without time zone NOT NULL,
    revoked_at timestamp without time zone,
    scopes character varying,
    resource_owner_type character varying NOT NULL
);


ALTER TABLE public.spree_oauth_access_grants OWNER TO postgres;

--
-- Name: spree_oauth_access_grants_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.spree_oauth_access_grants_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.spree_oauth_access_grants_id_seq OWNER TO postgres;

--
-- Name: spree_oauth_access_grants_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.spree_oauth_access_grants_id_seq OWNED BY public.spree_oauth_access_grants.id;


--
-- Name: spree_oauth_access_tokens; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.spree_oauth_access_tokens (
    id bigint NOT NULL,
    resource_owner_id bigint,
    application_id bigint,
    token character varying NOT NULL,
    refresh_token character varying,
    expires_in integer,
    revoked_at timestamp without time zone,
    created_at timestamp without time zone NOT NULL,
    scopes character varying,
    previous_refresh_token character varying DEFAULT ''::character varying NOT NULL,
    resource_owner_type character varying
);


ALTER TABLE public.spree_oauth_access_tokens OWNER TO postgres;

--
-- Name: spree_oauth_access_tokens_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.spree_oauth_access_tokens_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.spree_oauth_access_tokens_id_seq OWNER TO postgres;

--
-- Name: spree_oauth_access_tokens_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.spree_oauth_access_tokens_id_seq OWNED BY public.spree_oauth_access_tokens.id;


--
-- Name: spree_oauth_applications; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.spree_oauth_applications (
    id bigint NOT NULL,
    name character varying NOT NULL,
    uid character varying NOT NULL,
    secret character varying NOT NULL,
    redirect_uri text NOT NULL,
    scopes character varying DEFAULT ''::character varying NOT NULL,
    confidential boolean DEFAULT true NOT NULL,
    created_at timestamp without time zone NOT NULL,
    updated_at timestamp without time zone NOT NULL
);


ALTER TABLE public.spree_oauth_applications OWNER TO postgres;

--
-- Name: spree_oauth_applications_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.spree_oauth_applications_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.spree_oauth_applications_id_seq OWNER TO postgres;

--
-- Name: spree_oauth_applications_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.spree_oauth_applications_id_seq OWNED BY public.spree_oauth_applications.id;


--
-- Name: spree_option_type_prototypes; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.spree_option_type_prototypes (
    id bigint NOT NULL,
    prototype_id bigint,
    option_type_id bigint,
    created_at timestamp without time zone,
    updated_at timestamp without time zone
);


ALTER TABLE public.spree_option_type_prototypes OWNER TO postgres;

--
-- Name: spree_option_type_prototypes_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.spree_option_type_prototypes_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.spree_option_type_prototypes_id_seq OWNER TO postgres;

--
-- Name: spree_option_type_prototypes_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.spree_option_type_prototypes_id_seq OWNED BY public.spree_option_type_prototypes.id;


--
-- Name: spree_option_types; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.spree_option_types (
    id bigint NOT NULL,
    name character varying(100),
    presentation character varying(100),
    "position" integer DEFAULT 0 NOT NULL,
    created_at timestamp(6) without time zone NOT NULL,
    updated_at timestamp(6) without time zone NOT NULL,
    filterable boolean DEFAULT true NOT NULL,
    public_metadata jsonb,
    private_metadata jsonb
);


ALTER TABLE public.spree_option_types OWNER TO postgres;

--
-- Name: spree_option_types_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.spree_option_types_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.spree_option_types_id_seq OWNER TO postgres;

--
-- Name: spree_option_types_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.spree_option_types_id_seq OWNED BY public.spree_option_types.id;


--
-- Name: spree_option_value_variants; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.spree_option_value_variants (
    id bigint NOT NULL,
    variant_id bigint,
    option_value_id bigint,
    created_at timestamp without time zone,
    updated_at timestamp without time zone
);


ALTER TABLE public.spree_option_value_variants OWNER TO postgres;

--
-- Name: spree_option_value_variants_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.spree_option_value_variants_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.spree_option_value_variants_id_seq OWNER TO postgres;

--
-- Name: spree_option_value_variants_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.spree_option_value_variants_id_seq OWNED BY public.spree_option_value_variants.id;


--
-- Name: spree_option_values; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.spree_option_values (
    id bigint NOT NULL,
    "position" integer,
    name character varying,
    presentation character varying,
    option_type_id bigint,
    created_at timestamp(6) without time zone NOT NULL,
    updated_at timestamp(6) without time zone NOT NULL,
    public_metadata jsonb,
    private_metadata jsonb
);


ALTER TABLE public.spree_option_values OWNER TO postgres;

--
-- Name: spree_option_values_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.spree_option_values_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.spree_option_values_id_seq OWNER TO postgres;

--
-- Name: spree_option_values_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.spree_option_values_id_seq OWNED BY public.spree_option_values.id;


--
-- Name: spree_order_promotions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.spree_order_promotions (
    id bigint NOT NULL,
    order_id bigint,
    promotion_id bigint,
    created_at timestamp without time zone,
    updated_at timestamp without time zone
);


ALTER TABLE public.spree_order_promotions OWNER TO postgres;

--
-- Name: spree_order_promotions_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.spree_order_promotions_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.spree_order_promotions_id_seq OWNER TO postgres;

--
-- Name: spree_order_promotions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.spree_order_promotions_id_seq OWNED BY public.spree_order_promotions.id;


--
-- Name: spree_orders; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.spree_orders (
    id bigint NOT NULL,
    number character varying(32),
    item_total numeric(10,2) DEFAULT 0.0 NOT NULL,
    total numeric(10,2) DEFAULT 0.0 NOT NULL,
    state character varying,
    adjustment_total numeric(10,2) DEFAULT 0.0 NOT NULL,
    user_id bigint,
    completed_at timestamp without time zone,
    bill_address_id bigint,
    ship_address_id bigint,
    payment_total numeric(10,2) DEFAULT 0.0,
    shipment_state character varying,
    payment_state character varying,
    email character varying,
    special_instructions text,
    created_at timestamp(6) without time zone NOT NULL,
    updated_at timestamp(6) without time zone NOT NULL,
    currency character varying,
    last_ip_address character varying,
    created_by_id bigint,
    shipment_total numeric(10,2) DEFAULT 0.0 NOT NULL,
    additional_tax_total numeric(10,2) DEFAULT 0.0,
    promo_total numeric(10,2) DEFAULT 0.0,
    channel character varying DEFAULT 'spree'::character varying,
    included_tax_total numeric(10,2) DEFAULT 0.0 NOT NULL,
    item_count integer DEFAULT 0,
    approver_id bigint,
    approved_at timestamp without time zone,
    confirmation_delivered boolean DEFAULT false,
    considered_risky boolean DEFAULT false,
    token character varying,
    canceled_at timestamp without time zone,
    canceler_id bigint,
    store_id bigint,
    state_lock_version integer DEFAULT 0 NOT NULL,
    taxable_adjustment_total numeric(10,2) DEFAULT 0.0 NOT NULL,
    non_taxable_adjustment_total numeric(10,2) DEFAULT 0.0 NOT NULL,
    store_owner_notification_delivered boolean,
    public_metadata jsonb,
    private_metadata jsonb
);


ALTER TABLE public.spree_orders OWNER TO postgres;

--
-- Name: spree_orders_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.spree_orders_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.spree_orders_id_seq OWNER TO postgres;

--
-- Name: spree_orders_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.spree_orders_id_seq OWNED BY public.spree_orders.id;


--
-- Name: spree_payment_capture_events; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.spree_payment_capture_events (
    id bigint NOT NULL,
    amount numeric(10,2) DEFAULT 0.0,
    payment_id bigint,
    created_at timestamp(6) without time zone NOT NULL,
    updated_at timestamp(6) without time zone NOT NULL
);


ALTER TABLE public.spree_payment_capture_events OWNER TO postgres;

--
-- Name: spree_payment_capture_events_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.spree_payment_capture_events_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.spree_payment_capture_events_id_seq OWNER TO postgres;

--
-- Name: spree_payment_capture_events_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.spree_payment_capture_events_id_seq OWNED BY public.spree_payment_capture_events.id;


--
-- Name: spree_payment_methods; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.spree_payment_methods (
    id bigint NOT NULL,
    type character varying,
    name character varying,
    description text,
    active boolean DEFAULT true,
    deleted_at timestamp without time zone,
    created_at timestamp(6) without time zone NOT NULL,
    updated_at timestamp(6) without time zone NOT NULL,
    display_on character varying DEFAULT 'both'::character varying,
    auto_capture boolean,
    preferences text,
    "position" integer DEFAULT 0,
    public_metadata jsonb,
    private_metadata jsonb
);


ALTER TABLE public.spree_payment_methods OWNER TO postgres;

--
-- Name: spree_payment_methods_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.spree_payment_methods_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.spree_payment_methods_id_seq OWNER TO postgres;

--
-- Name: spree_payment_methods_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.spree_payment_methods_id_seq OWNED BY public.spree_payment_methods.id;


--
-- Name: spree_payment_methods_stores; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.spree_payment_methods_stores (
    payment_method_id bigint,
    store_id bigint
);


ALTER TABLE public.spree_payment_methods_stores OWNER TO postgres;

--
-- Name: spree_payments; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.spree_payments (
    id bigint NOT NULL,
    amount numeric(10,2) DEFAULT 0.0 NOT NULL,
    order_id bigint,
    source_type character varying,
    source_id bigint,
    payment_method_id bigint,
    state character varying,
    response_code character varying,
    avs_response character varying,
    created_at timestamp(6) without time zone NOT NULL,
    updated_at timestamp(6) without time zone NOT NULL,
    number character varying,
    cvv_response_code character varying,
    cvv_response_message character varying,
    public_metadata jsonb,
    private_metadata jsonb,
    intent_client_key character varying
);


ALTER TABLE public.spree_payments OWNER TO postgres;

--
-- Name: spree_payments_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.spree_payments_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.spree_payments_id_seq OWNER TO postgres;

--
-- Name: spree_payments_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.spree_payments_id_seq OWNED BY public.spree_payments.id;


--
-- Name: spree_preferences; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.spree_preferences (
    id bigint NOT NULL,
    value text,
    key character varying,
    created_at timestamp(6) without time zone NOT NULL,
    updated_at timestamp(6) without time zone NOT NULL
);


ALTER TABLE public.spree_preferences OWNER TO postgres;

--
-- Name: spree_preferences_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.spree_preferences_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.spree_preferences_id_seq OWNER TO postgres;

--
-- Name: spree_preferences_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.spree_preferences_id_seq OWNED BY public.spree_preferences.id;


--
-- Name: spree_prices; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.spree_prices (
    id bigint NOT NULL,
    variant_id bigint NOT NULL,
    amount numeric(10,2),
    currency character varying,
    deleted_at timestamp without time zone,
    created_at timestamp without time zone NOT NULL,
    updated_at timestamp without time zone NOT NULL,
    compare_at_amount numeric(10,2)
);


ALTER TABLE public.spree_prices OWNER TO postgres;

--
-- Name: spree_prices_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.spree_prices_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.spree_prices_id_seq OWNER TO postgres;

--
-- Name: spree_prices_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.spree_prices_id_seq OWNED BY public.spree_prices.id;


--
-- Name: spree_product_option_types; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.spree_product_option_types (
    id bigint NOT NULL,
    "position" integer,
    product_id bigint,
    option_type_id bigint,
    created_at timestamp(6) without time zone NOT NULL,
    updated_at timestamp(6) without time zone NOT NULL
);


ALTER TABLE public.spree_product_option_types OWNER TO postgres;

--
-- Name: spree_product_option_types_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.spree_product_option_types_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.spree_product_option_types_id_seq OWNER TO postgres;

--
-- Name: spree_product_option_types_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.spree_product_option_types_id_seq OWNED BY public.spree_product_option_types.id;


--
-- Name: spree_product_promotion_rules; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.spree_product_promotion_rules (
    id bigint NOT NULL,
    product_id bigint,
    promotion_rule_id bigint,
    created_at timestamp without time zone,
    updated_at timestamp without time zone
);


ALTER TABLE public.spree_product_promotion_rules OWNER TO postgres;

--
-- Name: spree_product_promotion_rules_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.spree_product_promotion_rules_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.spree_product_promotion_rules_id_seq OWNER TO postgres;

--
-- Name: spree_product_promotion_rules_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.spree_product_promotion_rules_id_seq OWNED BY public.spree_product_promotion_rules.id;


--
-- Name: spree_product_properties; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.spree_product_properties (
    id bigint NOT NULL,
    value character varying,
    product_id bigint,
    property_id bigint,
    created_at timestamp(6) without time zone NOT NULL,
    updated_at timestamp(6) without time zone NOT NULL,
    "position" integer DEFAULT 0,
    show_property boolean DEFAULT true,
    filter_param character varying
);


ALTER TABLE public.spree_product_properties OWNER TO postgres;

--
-- Name: spree_product_properties_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.spree_product_properties_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.spree_product_properties_id_seq OWNER TO postgres;

--
-- Name: spree_product_properties_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.spree_product_properties_id_seq OWNED BY public.spree_product_properties.id;


--
-- Name: spree_products; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.spree_products (
    id bigint NOT NULL,
    name character varying DEFAULT ''::character varying NOT NULL,
    description text,
    available_on timestamp without time zone,
    deleted_at timestamp without time zone,
    slug character varying,
    meta_description text,
    meta_keywords character varying,
    tax_category_id bigint,
    shipping_category_id bigint,
    created_at timestamp(6) without time zone NOT NULL,
    updated_at timestamp(6) without time zone NOT NULL,
    promotionable boolean DEFAULT true,
    meta_title character varying,
    discontinue_on timestamp without time zone,
    public_metadata jsonb,
    private_metadata jsonb
);


ALTER TABLE public.spree_products OWNER TO postgres;

--
-- Name: spree_products_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.spree_products_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.spree_products_id_seq OWNER TO postgres;

--
-- Name: spree_products_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.spree_products_id_seq OWNED BY public.spree_products.id;


--
-- Name: spree_products_stores; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.spree_products_stores (
    id bigint NOT NULL,
    product_id bigint,
    store_id bigint,
    created_at timestamp without time zone NOT NULL,
    updated_at timestamp without time zone NOT NULL
);


ALTER TABLE public.spree_products_stores OWNER TO postgres;

--
-- Name: spree_products_stores_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.spree_products_stores_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.spree_products_stores_id_seq OWNER TO postgres;

--
-- Name: spree_products_stores_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.spree_products_stores_id_seq OWNED BY public.spree_products_stores.id;


--
-- Name: spree_products_taxons; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.spree_products_taxons (
    id bigint NOT NULL,
    product_id bigint,
    taxon_id bigint,
    "position" integer,
    created_at timestamp without time zone,
    updated_at timestamp without time zone
);


ALTER TABLE public.spree_products_taxons OWNER TO postgres;

--
-- Name: spree_products_taxons_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.spree_products_taxons_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.spree_products_taxons_id_seq OWNER TO postgres;

--
-- Name: spree_products_taxons_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.spree_products_taxons_id_seq OWNED BY public.spree_products_taxons.id;


--
-- Name: spree_promotion_action_line_items; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.spree_promotion_action_line_items (
    id bigint NOT NULL,
    promotion_action_id bigint,
    variant_id bigint,
    quantity integer DEFAULT 1,
    created_at timestamp without time zone,
    updated_at timestamp without time zone
);


ALTER TABLE public.spree_promotion_action_line_items OWNER TO postgres;

--
-- Name: spree_promotion_action_line_items_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.spree_promotion_action_line_items_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.spree_promotion_action_line_items_id_seq OWNER TO postgres;

--
-- Name: spree_promotion_action_line_items_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.spree_promotion_action_line_items_id_seq OWNED BY public.spree_promotion_action_line_items.id;


--
-- Name: spree_promotion_actions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.spree_promotion_actions (
    id bigint NOT NULL,
    promotion_id bigint,
    "position" integer,
    type character varying,
    deleted_at timestamp without time zone,
    created_at timestamp without time zone,
    updated_at timestamp without time zone
);


ALTER TABLE public.spree_promotion_actions OWNER TO postgres;

--
-- Name: spree_promotion_actions_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.spree_promotion_actions_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.spree_promotion_actions_id_seq OWNER TO postgres;

--
-- Name: spree_promotion_actions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.spree_promotion_actions_id_seq OWNED BY public.spree_promotion_actions.id;


--
-- Name: spree_promotion_categories; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.spree_promotion_categories (
    id bigint NOT NULL,
    name character varying,
    created_at timestamp(6) without time zone NOT NULL,
    updated_at timestamp(6) without time zone NOT NULL,
    code character varying
);


ALTER TABLE public.spree_promotion_categories OWNER TO postgres;

--
-- Name: spree_promotion_categories_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.spree_promotion_categories_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.spree_promotion_categories_id_seq OWNER TO postgres;

--
-- Name: spree_promotion_categories_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.spree_promotion_categories_id_seq OWNED BY public.spree_promotion_categories.id;


--
-- Name: spree_promotion_rule_taxons; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.spree_promotion_rule_taxons (
    id bigint NOT NULL,
    taxon_id bigint,
    promotion_rule_id bigint,
    created_at timestamp without time zone,
    updated_at timestamp without time zone
);


ALTER TABLE public.spree_promotion_rule_taxons OWNER TO postgres;

--
-- Name: spree_promotion_rule_taxons_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.spree_promotion_rule_taxons_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.spree_promotion_rule_taxons_id_seq OWNER TO postgres;

--
-- Name: spree_promotion_rule_taxons_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.spree_promotion_rule_taxons_id_seq OWNED BY public.spree_promotion_rule_taxons.id;


--
-- Name: spree_promotion_rule_users; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.spree_promotion_rule_users (
    id bigint NOT NULL,
    user_id bigint,
    promotion_rule_id bigint,
    created_at timestamp without time zone,
    updated_at timestamp without time zone
);


ALTER TABLE public.spree_promotion_rule_users OWNER TO postgres;

--
-- Name: spree_promotion_rule_users_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.spree_promotion_rule_users_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.spree_promotion_rule_users_id_seq OWNER TO postgres;

--
-- Name: spree_promotion_rule_users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.spree_promotion_rule_users_id_seq OWNED BY public.spree_promotion_rule_users.id;


--
-- Name: spree_promotion_rules; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.spree_promotion_rules (
    id bigint NOT NULL,
    promotion_id bigint,
    user_id bigint,
    product_group_id bigint,
    type character varying,
    created_at timestamp(6) without time zone NOT NULL,
    updated_at timestamp(6) without time zone NOT NULL,
    code character varying,
    preferences text
);


ALTER TABLE public.spree_promotion_rules OWNER TO postgres;

--
-- Name: spree_promotion_rules_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.spree_promotion_rules_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.spree_promotion_rules_id_seq OWNER TO postgres;

--
-- Name: spree_promotion_rules_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.spree_promotion_rules_id_seq OWNED BY public.spree_promotion_rules.id;


--
-- Name: spree_promotions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.spree_promotions (
    id bigint NOT NULL,
    description character varying,
    expires_at timestamp without time zone,
    starts_at timestamp without time zone,
    name character varying,
    type character varying,
    usage_limit integer,
    match_policy character varying DEFAULT 'all'::character varying,
    code character varying,
    advertise boolean DEFAULT false,
    path character varying,
    created_at timestamp(6) without time zone NOT NULL,
    updated_at timestamp(6) without time zone NOT NULL,
    promotion_category_id bigint,
    public_metadata jsonb,
    private_metadata jsonb
);


ALTER TABLE public.spree_promotions OWNER TO postgres;

--
-- Name: spree_promotions_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.spree_promotions_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.spree_promotions_id_seq OWNER TO postgres;

--
-- Name: spree_promotions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.spree_promotions_id_seq OWNED BY public.spree_promotions.id;


--
-- Name: spree_promotions_stores; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.spree_promotions_stores (
    id bigint NOT NULL,
    promotion_id bigint,
    store_id bigint,
    created_at timestamp without time zone NOT NULL,
    updated_at timestamp without time zone NOT NULL
);


ALTER TABLE public.spree_promotions_stores OWNER TO postgres;

--
-- Name: spree_promotions_stores_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.spree_promotions_stores_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.spree_promotions_stores_id_seq OWNER TO postgres;

--
-- Name: spree_promotions_stores_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.spree_promotions_stores_id_seq OWNED BY public.spree_promotions_stores.id;


--
-- Name: spree_properties; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.spree_properties (
    id bigint NOT NULL,
    name character varying,
    presentation character varying NOT NULL,
    created_at timestamp(6) without time zone NOT NULL,
    updated_at timestamp(6) without time zone NOT NULL,
    filterable boolean DEFAULT false NOT NULL,
    filter_param character varying,
    public_metadata jsonb,
    private_metadata jsonb
);


ALTER TABLE public.spree_properties OWNER TO postgres;

--
-- Name: spree_properties_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.spree_properties_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.spree_properties_id_seq OWNER TO postgres;

--
-- Name: spree_properties_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.spree_properties_id_seq OWNED BY public.spree_properties.id;


--
-- Name: spree_property_prototypes; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.spree_property_prototypes (
    id bigint NOT NULL,
    prototype_id bigint,
    property_id bigint,
    created_at timestamp without time zone,
    updated_at timestamp without time zone
);


ALTER TABLE public.spree_property_prototypes OWNER TO postgres;

--
-- Name: spree_property_prototypes_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.spree_property_prototypes_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.spree_property_prototypes_id_seq OWNER TO postgres;

--
-- Name: spree_property_prototypes_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.spree_property_prototypes_id_seq OWNED BY public.spree_property_prototypes.id;


--
-- Name: spree_prototype_taxons; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.spree_prototype_taxons (
    id bigint NOT NULL,
    taxon_id bigint,
    prototype_id bigint,
    created_at timestamp without time zone,
    updated_at timestamp without time zone
);


ALTER TABLE public.spree_prototype_taxons OWNER TO postgres;

--
-- Name: spree_prototype_taxons_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.spree_prototype_taxons_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.spree_prototype_taxons_id_seq OWNER TO postgres;

--
-- Name: spree_prototype_taxons_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.spree_prototype_taxons_id_seq OWNED BY public.spree_prototype_taxons.id;


--
-- Name: spree_prototypes; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.spree_prototypes (
    id bigint NOT NULL,
    name character varying,
    created_at timestamp(6) without time zone NOT NULL,
    updated_at timestamp(6) without time zone NOT NULL,
    public_metadata jsonb,
    private_metadata jsonb
);


ALTER TABLE public.spree_prototypes OWNER TO postgres;

--
-- Name: spree_prototypes_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.spree_prototypes_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.spree_prototypes_id_seq OWNER TO postgres;

--
-- Name: spree_prototypes_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.spree_prototypes_id_seq OWNED BY public.spree_prototypes.id;


--
-- Name: spree_refund_reasons; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.spree_refund_reasons (
    id bigint NOT NULL,
    name character varying,
    active boolean DEFAULT true,
    mutable boolean DEFAULT true,
    created_at timestamp(6) without time zone NOT NULL,
    updated_at timestamp(6) without time zone NOT NULL
);


ALTER TABLE public.spree_refund_reasons OWNER TO postgres;

--
-- Name: spree_refund_reasons_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.spree_refund_reasons_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.spree_refund_reasons_id_seq OWNER TO postgres;

--
-- Name: spree_refund_reasons_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.spree_refund_reasons_id_seq OWNED BY public.spree_refund_reasons.id;


--
-- Name: spree_refunds; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.spree_refunds (
    id bigint NOT NULL,
    payment_id bigint,
    amount numeric(10,2) DEFAULT 0.0 NOT NULL,
    transaction_id character varying,
    created_at timestamp(6) without time zone NOT NULL,
    updated_at timestamp(6) without time zone NOT NULL,
    refund_reason_id bigint,
    reimbursement_id bigint,
    public_metadata jsonb,
    private_metadata jsonb
);


ALTER TABLE public.spree_refunds OWNER TO postgres;

--
-- Name: spree_refunds_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.spree_refunds_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.spree_refunds_id_seq OWNER TO postgres;

--
-- Name: spree_refunds_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.spree_refunds_id_seq OWNED BY public.spree_refunds.id;


--
-- Name: spree_reimbursement_credits; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.spree_reimbursement_credits (
    id bigint NOT NULL,
    amount numeric(10,2) DEFAULT 0.0 NOT NULL,
    reimbursement_id bigint,
    creditable_id bigint,
    creditable_type character varying,
    created_at timestamp without time zone,
    updated_at timestamp without time zone
);


ALTER TABLE public.spree_reimbursement_credits OWNER TO postgres;

--
-- Name: spree_reimbursement_credits_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.spree_reimbursement_credits_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.spree_reimbursement_credits_id_seq OWNER TO postgres;

--
-- Name: spree_reimbursement_credits_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.spree_reimbursement_credits_id_seq OWNED BY public.spree_reimbursement_credits.id;


--
-- Name: spree_reimbursement_types; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.spree_reimbursement_types (
    id bigint NOT NULL,
    name character varying,
    active boolean DEFAULT true,
    mutable boolean DEFAULT true,
    created_at timestamp(6) without time zone NOT NULL,
    updated_at timestamp(6) without time zone NOT NULL,
    type character varying
);


ALTER TABLE public.spree_reimbursement_types OWNER TO postgres;

--
-- Name: spree_reimbursement_types_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.spree_reimbursement_types_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.spree_reimbursement_types_id_seq OWNER TO postgres;

--
-- Name: spree_reimbursement_types_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.spree_reimbursement_types_id_seq OWNED BY public.spree_reimbursement_types.id;


--
-- Name: spree_reimbursements; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.spree_reimbursements (
    id bigint NOT NULL,
    number character varying,
    reimbursement_status character varying,
    customer_return_id bigint,
    order_id bigint,
    total numeric(10,2),
    created_at timestamp(6) without time zone NOT NULL,
    updated_at timestamp(6) without time zone NOT NULL
);


ALTER TABLE public.spree_reimbursements OWNER TO postgres;

--
-- Name: spree_reimbursements_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.spree_reimbursements_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.spree_reimbursements_id_seq OWNER TO postgres;

--
-- Name: spree_reimbursements_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.spree_reimbursements_id_seq OWNED BY public.spree_reimbursements.id;


--
-- Name: spree_return_authorization_reasons; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.spree_return_authorization_reasons (
    id bigint NOT NULL,
    name character varying,
    active boolean DEFAULT true,
    mutable boolean DEFAULT true,
    created_at timestamp(6) without time zone NOT NULL,
    updated_at timestamp(6) without time zone NOT NULL
);


ALTER TABLE public.spree_return_authorization_reasons OWNER TO postgres;

--
-- Name: spree_return_authorization_reasons_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.spree_return_authorization_reasons_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.spree_return_authorization_reasons_id_seq OWNER TO postgres;

--
-- Name: spree_return_authorization_reasons_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.spree_return_authorization_reasons_id_seq OWNED BY public.spree_return_authorization_reasons.id;


--
-- Name: spree_return_authorizations; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.spree_return_authorizations (
    id bigint NOT NULL,
    number character varying,
    state character varying,
    order_id bigint,
    memo text,
    created_at timestamp without time zone,
    updated_at timestamp without time zone,
    stock_location_id bigint,
    return_authorization_reason_id bigint
);


ALTER TABLE public.spree_return_authorizations OWNER TO postgres;

--
-- Name: spree_return_authorizations_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.spree_return_authorizations_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.spree_return_authorizations_id_seq OWNER TO postgres;

--
-- Name: spree_return_authorizations_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.spree_return_authorizations_id_seq OWNED BY public.spree_return_authorizations.id;


--
-- Name: spree_return_items; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.spree_return_items (
    id bigint NOT NULL,
    return_authorization_id bigint,
    inventory_unit_id bigint,
    exchange_variant_id bigint,
    created_at timestamp(6) without time zone NOT NULL,
    updated_at timestamp(6) without time zone NOT NULL,
    pre_tax_amount numeric(12,4) DEFAULT 0.0 NOT NULL,
    included_tax_total numeric(12,4) DEFAULT 0.0 NOT NULL,
    additional_tax_total numeric(12,4) DEFAULT 0.0 NOT NULL,
    reception_status character varying,
    acceptance_status character varying,
    customer_return_id bigint,
    reimbursement_id bigint,
    acceptance_status_errors text,
    preferred_reimbursement_type_id bigint,
    override_reimbursement_type_id bigint,
    resellable boolean DEFAULT true NOT NULL
);


ALTER TABLE public.spree_return_items OWNER TO postgres;

--
-- Name: spree_return_items_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.spree_return_items_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.spree_return_items_id_seq OWNER TO postgres;

--
-- Name: spree_return_items_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.spree_return_items_id_seq OWNED BY public.spree_return_items.id;


--
-- Name: spree_role_users; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.spree_role_users (
    id bigint NOT NULL,
    role_id bigint,
    user_id bigint,
    created_at timestamp without time zone,
    updated_at timestamp without time zone
);


ALTER TABLE public.spree_role_users OWNER TO postgres;

--
-- Name: spree_role_users_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.spree_role_users_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.spree_role_users_id_seq OWNER TO postgres;

--
-- Name: spree_role_users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.spree_role_users_id_seq OWNED BY public.spree_role_users.id;


--
-- Name: spree_roles; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.spree_roles (
    id bigint NOT NULL,
    name character varying,
    created_at timestamp without time zone,
    updated_at timestamp without time zone
);


ALTER TABLE public.spree_roles OWNER TO postgres;

--
-- Name: spree_roles_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.spree_roles_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.spree_roles_id_seq OWNER TO postgres;

--
-- Name: spree_roles_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.spree_roles_id_seq OWNED BY public.spree_roles.id;


--
-- Name: spree_shipments; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.spree_shipments (
    id bigint NOT NULL,
    tracking character varying,
    number character varying,
    cost numeric(10,2) DEFAULT 0.0,
    shipped_at timestamp without time zone,
    order_id bigint,
    address_id bigint,
    state character varying,
    created_at timestamp(6) without time zone NOT NULL,
    updated_at timestamp(6) without time zone NOT NULL,
    stock_location_id bigint,
    adjustment_total numeric(10,2) DEFAULT 0.0,
    additional_tax_total numeric(10,2) DEFAULT 0.0,
    promo_total numeric(10,2) DEFAULT 0.0,
    included_tax_total numeric(10,2) DEFAULT 0.0 NOT NULL,
    pre_tax_amount numeric(12,4) DEFAULT 0.0 NOT NULL,
    taxable_adjustment_total numeric(10,2) DEFAULT 0.0 NOT NULL,
    non_taxable_adjustment_total numeric(10,2) DEFAULT 0.0 NOT NULL,
    public_metadata jsonb,
    private_metadata jsonb
);


ALTER TABLE public.spree_shipments OWNER TO postgres;

--
-- Name: spree_shipments_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.spree_shipments_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.spree_shipments_id_seq OWNER TO postgres;

--
-- Name: spree_shipments_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.spree_shipments_id_seq OWNED BY public.spree_shipments.id;


--
-- Name: spree_shipping_categories; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.spree_shipping_categories (
    id bigint NOT NULL,
    name character varying,
    created_at timestamp(6) without time zone NOT NULL,
    updated_at timestamp(6) without time zone NOT NULL
);


ALTER TABLE public.spree_shipping_categories OWNER TO postgres;

--
-- Name: spree_shipping_categories_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.spree_shipping_categories_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.spree_shipping_categories_id_seq OWNER TO postgres;

--
-- Name: spree_shipping_categories_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.spree_shipping_categories_id_seq OWNED BY public.spree_shipping_categories.id;


--
-- Name: spree_shipping_method_categories; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.spree_shipping_method_categories (
    id bigint NOT NULL,
    shipping_method_id bigint NOT NULL,
    shipping_category_id bigint NOT NULL,
    created_at timestamp(6) without time zone NOT NULL,
    updated_at timestamp(6) without time zone NOT NULL
);


ALTER TABLE public.spree_shipping_method_categories OWNER TO postgres;

--
-- Name: spree_shipping_method_categories_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.spree_shipping_method_categories_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.spree_shipping_method_categories_id_seq OWNER TO postgres;

--
-- Name: spree_shipping_method_categories_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.spree_shipping_method_categories_id_seq OWNED BY public.spree_shipping_method_categories.id;


--
-- Name: spree_shipping_method_zones; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.spree_shipping_method_zones (
    id bigint NOT NULL,
    shipping_method_id bigint,
    zone_id bigint,
    created_at timestamp without time zone,
    updated_at timestamp without time zone
);


ALTER TABLE public.spree_shipping_method_zones OWNER TO postgres;

--
-- Name: spree_shipping_method_zones_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.spree_shipping_method_zones_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.spree_shipping_method_zones_id_seq OWNER TO postgres;

--
-- Name: spree_shipping_method_zones_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.spree_shipping_method_zones_id_seq OWNED BY public.spree_shipping_method_zones.id;


--
-- Name: spree_shipping_methods; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.spree_shipping_methods (
    id bigint NOT NULL,
    name character varying,
    display_on character varying,
    deleted_at timestamp without time zone,
    created_at timestamp(6) without time zone NOT NULL,
    updated_at timestamp(6) without time zone NOT NULL,
    tracking_url character varying,
    admin_name character varying,
    tax_category_id bigint,
    code character varying,
    public_metadata jsonb,
    private_metadata jsonb
);


ALTER TABLE public.spree_shipping_methods OWNER TO postgres;

--
-- Name: spree_shipping_methods_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.spree_shipping_methods_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.spree_shipping_methods_id_seq OWNER TO postgres;

--
-- Name: spree_shipping_methods_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.spree_shipping_methods_id_seq OWNED BY public.spree_shipping_methods.id;


--
-- Name: spree_shipping_rates; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.spree_shipping_rates (
    id bigint NOT NULL,
    shipment_id bigint,
    shipping_method_id bigint,
    selected boolean DEFAULT false,
    cost numeric(8,2) DEFAULT 0.0,
    created_at timestamp(6) without time zone NOT NULL,
    updated_at timestamp(6) without time zone NOT NULL,
    tax_rate_id bigint
);


ALTER TABLE public.spree_shipping_rates OWNER TO postgres;

--
-- Name: spree_shipping_rates_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.spree_shipping_rates_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.spree_shipping_rates_id_seq OWNER TO postgres;

--
-- Name: spree_shipping_rates_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.spree_shipping_rates_id_seq OWNED BY public.spree_shipping_rates.id;


--
-- Name: spree_state_changes; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.spree_state_changes (
    id bigint NOT NULL,
    name character varying,
    previous_state character varying,
    stateful_id bigint,
    user_id bigint,
    stateful_type character varying,
    next_state character varying,
    created_at timestamp(6) without time zone NOT NULL,
    updated_at timestamp(6) without time zone NOT NULL
);


ALTER TABLE public.spree_state_changes OWNER TO postgres;

--
-- Name: spree_state_changes_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.spree_state_changes_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.spree_state_changes_id_seq OWNER TO postgres;

--
-- Name: spree_state_changes_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.spree_state_changes_id_seq OWNED BY public.spree_state_changes.id;


--
-- Name: spree_states; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.spree_states (
    id bigint NOT NULL,
    name character varying,
    abbr character varying,
    country_id bigint,
    updated_at timestamp without time zone,
    created_at timestamp without time zone
);


ALTER TABLE public.spree_states OWNER TO postgres;

--
-- Name: spree_states_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.spree_states_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.spree_states_id_seq OWNER TO postgres;

--
-- Name: spree_states_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.spree_states_id_seq OWNED BY public.spree_states.id;


--
-- Name: spree_stock_items; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.spree_stock_items (
    id bigint NOT NULL,
    stock_location_id bigint,
    variant_id bigint,
    count_on_hand integer DEFAULT 0 NOT NULL,
    created_at timestamp(6) without time zone NOT NULL,
    updated_at timestamp(6) without time zone NOT NULL,
    backorderable boolean DEFAULT false,
    deleted_at timestamp without time zone
);


ALTER TABLE public.spree_stock_items OWNER TO postgres;

--
-- Name: spree_stock_items_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.spree_stock_items_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.spree_stock_items_id_seq OWNER TO postgres;

--
-- Name: spree_stock_items_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.spree_stock_items_id_seq OWNED BY public.spree_stock_items.id;


--
-- Name: spree_stock_locations; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.spree_stock_locations (
    id bigint NOT NULL,
    name character varying,
    created_at timestamp(6) without time zone NOT NULL,
    updated_at timestamp(6) without time zone NOT NULL,
    "default" boolean DEFAULT false NOT NULL,
    address1 character varying,
    address2 character varying,
    city character varying,
    state_id bigint,
    state_name character varying,
    country_id bigint,
    zipcode character varying,
    phone character varying,
    active boolean DEFAULT true,
    backorderable_default boolean DEFAULT false,
    propagate_all_variants boolean DEFAULT true,
    admin_name character varying
);


ALTER TABLE public.spree_stock_locations OWNER TO postgres;

--
-- Name: spree_stock_locations_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.spree_stock_locations_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.spree_stock_locations_id_seq OWNER TO postgres;

--
-- Name: spree_stock_locations_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.spree_stock_locations_id_seq OWNED BY public.spree_stock_locations.id;


--
-- Name: spree_stock_movements; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.spree_stock_movements (
    id bigint NOT NULL,
    stock_item_id bigint,
    quantity integer DEFAULT 0,
    action character varying,
    created_at timestamp(6) without time zone NOT NULL,
    updated_at timestamp(6) without time zone NOT NULL,
    originator_type character varying,
    originator_id bigint
);


ALTER TABLE public.spree_stock_movements OWNER TO postgres;

--
-- Name: spree_stock_movements_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.spree_stock_movements_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.spree_stock_movements_id_seq OWNER TO postgres;

--
-- Name: spree_stock_movements_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.spree_stock_movements_id_seq OWNED BY public.spree_stock_movements.id;


--
-- Name: spree_stock_transfers; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.spree_stock_transfers (
    id bigint NOT NULL,
    type character varying,
    reference character varying,
    source_location_id bigint,
    destination_location_id bigint,
    created_at timestamp(6) without time zone NOT NULL,
    updated_at timestamp(6) without time zone NOT NULL,
    number character varying,
    public_metadata jsonb,
    private_metadata jsonb
);


ALTER TABLE public.spree_stock_transfers OWNER TO postgres;

--
-- Name: spree_stock_transfers_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.spree_stock_transfers_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.spree_stock_transfers_id_seq OWNER TO postgres;

--
-- Name: spree_stock_transfers_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.spree_stock_transfers_id_seq OWNED BY public.spree_stock_transfers.id;


--
-- Name: spree_store_credit_categories; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.spree_store_credit_categories (
    id bigint NOT NULL,
    name character varying,
    created_at timestamp(6) without time zone NOT NULL,
    updated_at timestamp(6) without time zone NOT NULL
);


ALTER TABLE public.spree_store_credit_categories OWNER TO postgres;

--
-- Name: spree_store_credit_categories_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.spree_store_credit_categories_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.spree_store_credit_categories_id_seq OWNER TO postgres;

--
-- Name: spree_store_credit_categories_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.spree_store_credit_categories_id_seq OWNED BY public.spree_store_credit_categories.id;


--
-- Name: spree_store_credit_events; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.spree_store_credit_events (
    id bigint NOT NULL,
    store_credit_id bigint NOT NULL,
    action character varying NOT NULL,
    amount numeric(8,2),
    authorization_code character varying NOT NULL,
    user_total_amount numeric(8,2) DEFAULT 0.0 NOT NULL,
    originator_id bigint,
    originator_type character varying,
    deleted_at timestamp without time zone,
    created_at timestamp(6) without time zone NOT NULL,
    updated_at timestamp(6) without time zone NOT NULL
);


ALTER TABLE public.spree_store_credit_events OWNER TO postgres;

--
-- Name: spree_store_credit_events_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.spree_store_credit_events_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.spree_store_credit_events_id_seq OWNER TO postgres;

--
-- Name: spree_store_credit_events_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.spree_store_credit_events_id_seq OWNED BY public.spree_store_credit_events.id;


--
-- Name: spree_store_credit_types; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.spree_store_credit_types (
    id bigint NOT NULL,
    name character varying,
    priority integer,
    created_at timestamp(6) without time zone NOT NULL,
    updated_at timestamp(6) without time zone NOT NULL
);


ALTER TABLE public.spree_store_credit_types OWNER TO postgres;

--
-- Name: spree_store_credit_types_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.spree_store_credit_types_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.spree_store_credit_types_id_seq OWNER TO postgres;

--
-- Name: spree_store_credit_types_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.spree_store_credit_types_id_seq OWNED BY public.spree_store_credit_types.id;


--
-- Name: spree_store_credits; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.spree_store_credits (
    id bigint NOT NULL,
    user_id bigint,
    category_id bigint,
    created_by_id bigint,
    amount numeric(8,2) DEFAULT 0.0 NOT NULL,
    amount_used numeric(8,2) DEFAULT 0.0 NOT NULL,
    memo text,
    deleted_at timestamp without time zone,
    currency character varying,
    amount_authorized numeric(8,2) DEFAULT 0.0 NOT NULL,
    originator_id bigint,
    originator_type character varying,
    type_id bigint,
    created_at timestamp(6) without time zone NOT NULL,
    updated_at timestamp(6) without time zone NOT NULL,
    store_id bigint,
    public_metadata jsonb,
    private_metadata jsonb
);


ALTER TABLE public.spree_store_credits OWNER TO postgres;

--
-- Name: spree_store_credits_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.spree_store_credits_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.spree_store_credits_id_seq OWNER TO postgres;

--
-- Name: spree_store_credits_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.spree_store_credits_id_seq OWNED BY public.spree_store_credits.id;


--
-- Name: spree_stores; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.spree_stores (
    id bigint NOT NULL,
    name character varying,
    url character varying,
    meta_description text,
    meta_keywords text,
    seo_title character varying,
    mail_from_address character varying,
    default_currency character varying,
    code character varying,
    "default" boolean DEFAULT false NOT NULL,
    created_at timestamp(6) without time zone NOT NULL,
    updated_at timestamp(6) without time zone NOT NULL,
    supported_currencies character varying,
    facebook character varying,
    twitter character varying,
    instagram character varying,
    default_locale character varying,
    customer_support_email character varying,
    default_country_id bigint,
    description text,
    address text,
    contact_phone character varying,
    new_order_notifications_email character varying,
    checkout_zone_id bigint,
    seo_robots character varying,
    supported_locales character varying,
    deleted_at timestamp without time zone,
    settings jsonb
);


ALTER TABLE public.spree_stores OWNER TO postgres;

--
-- Name: spree_stores_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.spree_stores_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.spree_stores_id_seq OWNER TO postgres;

--
-- Name: spree_stores_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.spree_stores_id_seq OWNED BY public.spree_stores.id;


--
-- Name: spree_tax_categories; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.spree_tax_categories (
    id bigint NOT NULL,
    name character varying,
    description character varying,
    is_default boolean DEFAULT false,
    deleted_at timestamp without time zone,
    created_at timestamp(6) without time zone NOT NULL,
    updated_at timestamp(6) without time zone NOT NULL,
    tax_code character varying
);


ALTER TABLE public.spree_tax_categories OWNER TO postgres;

--
-- Name: spree_tax_categories_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.spree_tax_categories_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.spree_tax_categories_id_seq OWNER TO postgres;

--
-- Name: spree_tax_categories_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.spree_tax_categories_id_seq OWNED BY public.spree_tax_categories.id;


--
-- Name: spree_tax_rates; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.spree_tax_rates (
    id bigint NOT NULL,
    amount numeric(8,5),
    zone_id bigint,
    tax_category_id bigint,
    included_in_price boolean DEFAULT false,
    created_at timestamp(6) without time zone NOT NULL,
    updated_at timestamp(6) without time zone NOT NULL,
    name character varying,
    show_rate_in_label boolean DEFAULT true,
    deleted_at timestamp without time zone
);


ALTER TABLE public.spree_tax_rates OWNER TO postgres;

--
-- Name: spree_tax_rates_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.spree_tax_rates_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.spree_tax_rates_id_seq OWNER TO postgres;

--
-- Name: spree_tax_rates_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.spree_tax_rates_id_seq OWNED BY public.spree_tax_rates.id;


--
-- Name: spree_taxonomies; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.spree_taxonomies (
    id bigint NOT NULL,
    name character varying NOT NULL,
    created_at timestamp(6) without time zone NOT NULL,
    updated_at timestamp(6) without time zone NOT NULL,
    "position" integer DEFAULT 0,
    store_id bigint,
    public_metadata jsonb,
    private_metadata jsonb
);


ALTER TABLE public.spree_taxonomies OWNER TO postgres;

--
-- Name: spree_taxonomies_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.spree_taxonomies_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.spree_taxonomies_id_seq OWNER TO postgres;

--
-- Name: spree_taxonomies_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.spree_taxonomies_id_seq OWNED BY public.spree_taxonomies.id;


--
-- Name: spree_taxons; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.spree_taxons (
    id bigint NOT NULL,
    parent_id bigint,
    "position" integer DEFAULT 0,
    name character varying NOT NULL,
    permalink character varying,
    taxonomy_id bigint,
    lft bigint,
    rgt bigint,
    description text,
    created_at timestamp(6) without time zone NOT NULL,
    updated_at timestamp(6) without time zone NOT NULL,
    meta_title character varying,
    meta_description character varying,
    meta_keywords character varying,
    depth integer,
    hide_from_nav boolean DEFAULT false,
    public_metadata jsonb,
    private_metadata jsonb
);


ALTER TABLE public.spree_taxons OWNER TO postgres;

--
-- Name: spree_taxons_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.spree_taxons_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.spree_taxons_id_seq OWNER TO postgres;

--
-- Name: spree_taxons_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.spree_taxons_id_seq OWNED BY public.spree_taxons.id;


--
-- Name: spree_trackers; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.spree_trackers (
    id bigint NOT NULL,
    analytics_id character varying,
    active boolean DEFAULT true,
    created_at timestamp(6) without time zone NOT NULL,
    updated_at timestamp(6) without time zone NOT NULL,
    engine integer DEFAULT 0 NOT NULL
);


ALTER TABLE public.spree_trackers OWNER TO postgres;

--
-- Name: spree_trackers_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.spree_trackers_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.spree_trackers_id_seq OWNER TO postgres;

--
-- Name: spree_trackers_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.spree_trackers_id_seq OWNED BY public.spree_trackers.id;


--
-- Name: spree_users; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.spree_users (
    id bigint NOT NULL,
    encrypted_password character varying(128),
    password_salt character varying(128),
    email character varying,
    remember_token character varying,
    persistence_token character varying,
    reset_password_token character varying,
    perishable_token character varying,
    sign_in_count integer DEFAULT 0 NOT NULL,
    failed_attempts integer DEFAULT 0 NOT NULL,
    last_request_at timestamp without time zone,
    current_sign_in_at timestamp without time zone,
    last_sign_in_at timestamp without time zone,
    current_sign_in_ip character varying,
    last_sign_in_ip character varying,
    login character varying,
    ship_address_id bigint,
    bill_address_id bigint,
    authentication_token character varying,
    unlock_token character varying,
    locked_at timestamp without time zone,
    reset_password_sent_at timestamp without time zone,
    created_at timestamp(6) without time zone NOT NULL,
    updated_at timestamp(6) without time zone NOT NULL,
    public_metadata jsonb,
    private_metadata jsonb,
    spree_api_key character varying(48),
    remember_created_at timestamp without time zone,
    deleted_at timestamp without time zone,
    confirmation_token character varying,
    confirmed_at timestamp without time zone,
    confirmation_sent_at timestamp without time zone
);


ALTER TABLE public.spree_users OWNER TO postgres;

--
-- Name: spree_users_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.spree_users_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.spree_users_id_seq OWNER TO postgres;

--
-- Name: spree_users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.spree_users_id_seq OWNED BY public.spree_users.id;


--
-- Name: spree_variants; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.spree_variants (
    id bigint NOT NULL,
    sku character varying DEFAULT ''::character varying NOT NULL,
    weight numeric(8,2) DEFAULT 0.0,
    height numeric(8,2),
    width numeric(8,2),
    depth numeric(8,2),
    deleted_at timestamp without time zone,
    is_master boolean DEFAULT false,
    product_id bigint,
    cost_price numeric(10,2),
    "position" integer,
    cost_currency character varying,
    track_inventory boolean DEFAULT true,
    tax_category_id bigint,
    updated_at timestamp without time zone NOT NULL,
    discontinue_on timestamp without time zone,
    created_at timestamp without time zone NOT NULL,
    public_metadata jsonb,
    private_metadata jsonb
);


ALTER TABLE public.spree_variants OWNER TO postgres;

--
-- Name: spree_variants_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.spree_variants_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.spree_variants_id_seq OWNER TO postgres;

--
-- Name: spree_variants_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.spree_variants_id_seq OWNED BY public.spree_variants.id;


--
-- Name: spree_webhooks_events; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.spree_webhooks_events (
    id bigint NOT NULL,
    execution_time integer,
    name character varying NOT NULL,
    request_errors character varying,
    response_code character varying,
    subscriber_id bigint NOT NULL,
    success boolean,
    url character varying NOT NULL,
    created_at timestamp without time zone NOT NULL,
    updated_at timestamp without time zone NOT NULL
);


ALTER TABLE public.spree_webhooks_events OWNER TO postgres;

--
-- Name: spree_webhooks_events_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.spree_webhooks_events_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.spree_webhooks_events_id_seq OWNER TO postgres;

--
-- Name: spree_webhooks_events_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.spree_webhooks_events_id_seq OWNED BY public.spree_webhooks_events.id;


--
-- Name: spree_webhooks_subscribers; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.spree_webhooks_subscribers (
    id bigint NOT NULL,
    url character varying NOT NULL,
    active boolean DEFAULT false,
    subscriptions jsonb,
    created_at timestamp without time zone NOT NULL,
    updated_at timestamp without time zone NOT NULL
);


ALTER TABLE public.spree_webhooks_subscribers OWNER TO postgres;

--
-- Name: spree_webhooks_subscribers_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.spree_webhooks_subscribers_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.spree_webhooks_subscribers_id_seq OWNER TO postgres;

--
-- Name: spree_webhooks_subscribers_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.spree_webhooks_subscribers_id_seq OWNED BY public.spree_webhooks_subscribers.id;


--
-- Name: spree_wished_items; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.spree_wished_items (
    id bigint NOT NULL,
    variant_id bigint,
    wishlist_id bigint,
    quantity integer DEFAULT 1 NOT NULL,
    created_at timestamp without time zone NOT NULL,
    updated_at timestamp without time zone NOT NULL
);


ALTER TABLE public.spree_wished_items OWNER TO postgres;

--
-- Name: spree_wished_items_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.spree_wished_items_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.spree_wished_items_id_seq OWNER TO postgres;

--
-- Name: spree_wished_items_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.spree_wished_items_id_seq OWNED BY public.spree_wished_items.id;


--
-- Name: spree_wishlists; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.spree_wishlists (
    id bigint NOT NULL,
    user_id bigint,
    store_id bigint,
    name character varying,
    token character varying NOT NULL,
    is_private boolean DEFAULT true NOT NULL,
    is_default boolean DEFAULT false NOT NULL,
    created_at timestamp without time zone NOT NULL,
    updated_at timestamp without time zone NOT NULL
);


ALTER TABLE public.spree_wishlists OWNER TO postgres;

--
-- Name: spree_wishlists_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.spree_wishlists_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.spree_wishlists_id_seq OWNER TO postgres;

--
-- Name: spree_wishlists_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.spree_wishlists_id_seq OWNED BY public.spree_wishlists.id;


--
-- Name: spree_zone_members; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.spree_zone_members (
    id bigint NOT NULL,
    zoneable_type character varying,
    zoneable_id bigint,
    zone_id bigint,
    created_at timestamp(6) without time zone NOT NULL,
    updated_at timestamp(6) without time zone NOT NULL
);


ALTER TABLE public.spree_zone_members OWNER TO postgres;

--
-- Name: spree_zone_members_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.spree_zone_members_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.spree_zone_members_id_seq OWNER TO postgres;

--
-- Name: spree_zone_members_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.spree_zone_members_id_seq OWNED BY public.spree_zone_members.id;


--
-- Name: spree_zones; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.spree_zones (
    id bigint NOT NULL,
    name character varying,
    description character varying,
    default_tax boolean DEFAULT false,
    zone_members_count integer DEFAULT 0,
    created_at timestamp(6) without time zone NOT NULL,
    updated_at timestamp(6) without time zone NOT NULL,
    kind character varying DEFAULT 'state'::character varying
);


ALTER TABLE public.spree_zones OWNER TO postgres;

--
-- Name: spree_zones_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.spree_zones_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.spree_zones_id_seq OWNER TO postgres;

--
-- Name: spree_zones_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.spree_zones_id_seq OWNED BY public.spree_zones.id;


--
-- Name: action_mailbox_inbound_emails id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.action_mailbox_inbound_emails ALTER COLUMN id SET DEFAULT nextval('public.action_mailbox_inbound_emails_id_seq'::regclass);


--
-- Name: action_text_rich_texts id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.action_text_rich_texts ALTER COLUMN id SET DEFAULT nextval('public.action_text_rich_texts_id_seq'::regclass);


--
-- Name: active_storage_attachments id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.active_storage_attachments ALTER COLUMN id SET DEFAULT nextval('public.active_storage_attachments_id_seq'::regclass);


--
-- Name: active_storage_blobs id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.active_storage_blobs ALTER COLUMN id SET DEFAULT nextval('public.active_storage_blobs_id_seq'::regclass);


--
-- Name: active_storage_variant_records id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.active_storage_variant_records ALTER COLUMN id SET DEFAULT nextval('public.active_storage_variant_records_id_seq'::regclass);


--
-- Name: friendly_id_slugs id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.friendly_id_slugs ALTER COLUMN id SET DEFAULT nextval('public.friendly_id_slugs_id_seq'::regclass);


--
-- Name: spree_addresses id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.spree_addresses ALTER COLUMN id SET DEFAULT nextval('public.spree_addresses_id_seq'::regclass);


--
-- Name: spree_adjustments id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.spree_adjustments ALTER COLUMN id SET DEFAULT nextval('public.spree_adjustments_id_seq'::regclass);


--
-- Name: spree_assets id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.spree_assets ALTER COLUMN id SET DEFAULT nextval('public.spree_assets_id_seq'::regclass);


--
-- Name: spree_calculators id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.spree_calculators ALTER COLUMN id SET DEFAULT nextval('public.spree_calculators_id_seq'::regclass);


--
-- Name: spree_checks id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.spree_checks ALTER COLUMN id SET DEFAULT nextval('public.spree_checks_id_seq'::regclass);


--
-- Name: spree_cms_pages id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.spree_cms_pages ALTER COLUMN id SET DEFAULT nextval('public.spree_cms_pages_id_seq'::regclass);


--
-- Name: spree_cms_sections id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.spree_cms_sections ALTER COLUMN id SET DEFAULT nextval('public.spree_cms_sections_id_seq'::regclass);


--
-- Name: spree_countries id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.spree_countries ALTER COLUMN id SET DEFAULT nextval('public.spree_countries_id_seq'::regclass);


--
-- Name: spree_credit_cards id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.spree_credit_cards ALTER COLUMN id SET DEFAULT nextval('public.spree_credit_cards_id_seq'::regclass);


--
-- Name: spree_customer_returns id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.spree_customer_returns ALTER COLUMN id SET DEFAULT nextval('public.spree_customer_returns_id_seq'::regclass);


--
-- Name: spree_digital_links id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.spree_digital_links ALTER COLUMN id SET DEFAULT nextval('public.spree_digital_links_id_seq'::regclass);


--
-- Name: spree_digitals id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.spree_digitals ALTER COLUMN id SET DEFAULT nextval('public.spree_digitals_id_seq'::regclass);


--
-- Name: spree_gateways id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.spree_gateways ALTER COLUMN id SET DEFAULT nextval('public.spree_gateways_id_seq'::regclass);


--
-- Name: spree_inventory_units id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.spree_inventory_units ALTER COLUMN id SET DEFAULT nextval('public.spree_inventory_units_id_seq'::regclass);


--
-- Name: spree_line_items id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.spree_line_items ALTER COLUMN id SET DEFAULT nextval('public.spree_line_items_id_seq'::regclass);


--
-- Name: spree_log_entries id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.spree_log_entries ALTER COLUMN id SET DEFAULT nextval('public.spree_log_entries_id_seq'::regclass);


--
-- Name: spree_menu_items id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.spree_menu_items ALTER COLUMN id SET DEFAULT nextval('public.spree_menu_items_id_seq'::regclass);


--
-- Name: spree_menus id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.spree_menus ALTER COLUMN id SET DEFAULT nextval('public.spree_menus_id_seq'::regclass);


--
-- Name: spree_oauth_access_grants id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.spree_oauth_access_grants ALTER COLUMN id SET DEFAULT nextval('public.spree_oauth_access_grants_id_seq'::regclass);


--
-- Name: spree_oauth_access_tokens id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.spree_oauth_access_tokens ALTER COLUMN id SET DEFAULT nextval('public.spree_oauth_access_tokens_id_seq'::regclass);


--
-- Name: spree_oauth_applications id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.spree_oauth_applications ALTER COLUMN id SET DEFAULT nextval('public.spree_oauth_applications_id_seq'::regclass);


--
-- Name: spree_option_type_prototypes id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.spree_option_type_prototypes ALTER COLUMN id SET DEFAULT nextval('public.spree_option_type_prototypes_id_seq'::regclass);


--
-- Name: spree_option_types id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.spree_option_types ALTER COLUMN id SET DEFAULT nextval('public.spree_option_types_id_seq'::regclass);


--
-- Name: spree_option_value_variants id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.spree_option_value_variants ALTER COLUMN id SET DEFAULT nextval('public.spree_option_value_variants_id_seq'::regclass);


--
-- Name: spree_option_values id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.spree_option_values ALTER COLUMN id SET DEFAULT nextval('public.spree_option_values_id_seq'::regclass);


--
-- Name: spree_order_promotions id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.spree_order_promotions ALTER COLUMN id SET DEFAULT nextval('public.spree_order_promotions_id_seq'::regclass);


--
-- Name: spree_orders id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.spree_orders ALTER COLUMN id SET DEFAULT nextval('public.spree_orders_id_seq'::regclass);


--
-- Name: spree_payment_capture_events id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.spree_payment_capture_events ALTER COLUMN id SET DEFAULT nextval('public.spree_payment_capture_events_id_seq'::regclass);


--
-- Name: spree_payment_methods id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.spree_payment_methods ALTER COLUMN id SET DEFAULT nextval('public.spree_payment_methods_id_seq'::regclass);


--
-- Name: spree_payments id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.spree_payments ALTER COLUMN id SET DEFAULT nextval('public.spree_payments_id_seq'::regclass);


--
-- Name: spree_preferences id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.spree_preferences ALTER COLUMN id SET DEFAULT nextval('public.spree_preferences_id_seq'::regclass);


--
-- Name: spree_prices id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.spree_prices ALTER COLUMN id SET DEFAULT nextval('public.spree_prices_id_seq'::regclass);


--
-- Name: spree_product_option_types id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.spree_product_option_types ALTER COLUMN id SET DEFAULT nextval('public.spree_product_option_types_id_seq'::regclass);


--
-- Name: spree_product_promotion_rules id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.spree_product_promotion_rules ALTER COLUMN id SET DEFAULT nextval('public.spree_product_promotion_rules_id_seq'::regclass);


--
-- Name: spree_product_properties id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.spree_product_properties ALTER COLUMN id SET DEFAULT nextval('public.spree_product_properties_id_seq'::regclass);


--
-- Name: spree_products id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.spree_products ALTER COLUMN id SET DEFAULT nextval('public.spree_products_id_seq'::regclass);


--
-- Name: spree_products_stores id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.spree_products_stores ALTER COLUMN id SET DEFAULT nextval('public.spree_products_stores_id_seq'::regclass);


--
-- Name: spree_products_taxons id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.spree_products_taxons ALTER COLUMN id SET DEFAULT nextval('public.spree_products_taxons_id_seq'::regclass);


--
-- Name: spree_promotion_action_line_items id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.spree_promotion_action_line_items ALTER COLUMN id SET DEFAULT nextval('public.spree_promotion_action_line_items_id_seq'::regclass);


--
-- Name: spree_promotion_actions id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.spree_promotion_actions ALTER COLUMN id SET DEFAULT nextval('public.spree_promotion_actions_id_seq'::regclass);


--
-- Name: spree_promotion_categories id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.spree_promotion_categories ALTER COLUMN id SET DEFAULT nextval('public.spree_promotion_categories_id_seq'::regclass);


--
-- Name: spree_promotion_rule_taxons id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.spree_promotion_rule_taxons ALTER COLUMN id SET DEFAULT nextval('public.spree_promotion_rule_taxons_id_seq'::regclass);


--
-- Name: spree_promotion_rule_users id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.spree_promotion_rule_users ALTER COLUMN id SET DEFAULT nextval('public.spree_promotion_rule_users_id_seq'::regclass);


--
-- Name: spree_promotion_rules id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.spree_promotion_rules ALTER COLUMN id SET DEFAULT nextval('public.spree_promotion_rules_id_seq'::regclass);


--
-- Name: spree_promotions id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.spree_promotions ALTER COLUMN id SET DEFAULT nextval('public.spree_promotions_id_seq'::regclass);


--
-- Name: spree_promotions_stores id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.spree_promotions_stores ALTER COLUMN id SET DEFAULT nextval('public.spree_promotions_stores_id_seq'::regclass);


--
-- Name: spree_properties id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.spree_properties ALTER COLUMN id SET DEFAULT nextval('public.spree_properties_id_seq'::regclass);


--
-- Name: spree_property_prototypes id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.spree_property_prototypes ALTER COLUMN id SET DEFAULT nextval('public.spree_property_prototypes_id_seq'::regclass);


--
-- Name: spree_prototype_taxons id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.spree_prototype_taxons ALTER COLUMN id SET DEFAULT nextval('public.spree_prototype_taxons_id_seq'::regclass);


--
-- Name: spree_prototypes id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.spree_prototypes ALTER COLUMN id SET DEFAULT nextval('public.spree_prototypes_id_seq'::regclass);


--
-- Name: spree_refund_reasons id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.spree_refund_reasons ALTER COLUMN id SET DEFAULT nextval('public.spree_refund_reasons_id_seq'::regclass);


--
-- Name: spree_refunds id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.spree_refunds ALTER COLUMN id SET DEFAULT nextval('public.spree_refunds_id_seq'::regclass);


--
-- Name: spree_reimbursement_credits id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.spree_reimbursement_credits ALTER COLUMN id SET DEFAULT nextval('public.spree_reimbursement_credits_id_seq'::regclass);


--
-- Name: spree_reimbursement_types id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.spree_reimbursement_types ALTER COLUMN id SET DEFAULT nextval('public.spree_reimbursement_types_id_seq'::regclass);


--
-- Name: spree_reimbursements id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.spree_reimbursements ALTER COLUMN id SET DEFAULT nextval('public.spree_reimbursements_id_seq'::regclass);


--
-- Name: spree_return_authorization_reasons id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.spree_return_authorization_reasons ALTER COLUMN id SET DEFAULT nextval('public.spree_return_authorization_reasons_id_seq'::regclass);


--
-- Name: spree_return_authorizations id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.spree_return_authorizations ALTER COLUMN id SET DEFAULT nextval('public.spree_return_authorizations_id_seq'::regclass);


--
-- Name: spree_return_items id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.spree_return_items ALTER COLUMN id SET DEFAULT nextval('public.spree_return_items_id_seq'::regclass);


--
-- Name: spree_role_users id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.spree_role_users ALTER COLUMN id SET DEFAULT nextval('public.spree_role_users_id_seq'::regclass);


--
-- Name: spree_roles id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.spree_roles ALTER COLUMN id SET DEFAULT nextval('public.spree_roles_id_seq'::regclass);


--
-- Name: spree_shipments id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.spree_shipments ALTER COLUMN id SET DEFAULT nextval('public.spree_shipments_id_seq'::regclass);


--
-- Name: spree_shipping_categories id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.spree_shipping_categories ALTER COLUMN id SET DEFAULT nextval('public.spree_shipping_categories_id_seq'::regclass);


--
-- Name: spree_shipping_method_categories id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.spree_shipping_method_categories ALTER COLUMN id SET DEFAULT nextval('public.spree_shipping_method_categories_id_seq'::regclass);


--
-- Name: spree_shipping_method_zones id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.spree_shipping_method_zones ALTER COLUMN id SET DEFAULT nextval('public.spree_shipping_method_zones_id_seq'::regclass);


--
-- Name: spree_shipping_methods id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.spree_shipping_methods ALTER COLUMN id SET DEFAULT nextval('public.spree_shipping_methods_id_seq'::regclass);


--
-- Name: spree_shipping_rates id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.spree_shipping_rates ALTER COLUMN id SET DEFAULT nextval('public.spree_shipping_rates_id_seq'::regclass);


--
-- Name: spree_state_changes id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.spree_state_changes ALTER COLUMN id SET DEFAULT nextval('public.spree_state_changes_id_seq'::regclass);


--
-- Name: spree_states id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.spree_states ALTER COLUMN id SET DEFAULT nextval('public.spree_states_id_seq'::regclass);


--
-- Name: spree_stock_items id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.spree_stock_items ALTER COLUMN id SET DEFAULT nextval('public.spree_stock_items_id_seq'::regclass);


--
-- Name: spree_stock_locations id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.spree_stock_locations ALTER COLUMN id SET DEFAULT nextval('public.spree_stock_locations_id_seq'::regclass);


--
-- Name: spree_stock_movements id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.spree_stock_movements ALTER COLUMN id SET DEFAULT nextval('public.spree_stock_movements_id_seq'::regclass);


--
-- Name: spree_stock_transfers id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.spree_stock_transfers ALTER COLUMN id SET DEFAULT nextval('public.spree_stock_transfers_id_seq'::regclass);


--
-- Name: spree_store_credit_categories id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.spree_store_credit_categories ALTER COLUMN id SET DEFAULT nextval('public.spree_store_credit_categories_id_seq'::regclass);


--
-- Name: spree_store_credit_events id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.spree_store_credit_events ALTER COLUMN id SET DEFAULT nextval('public.spree_store_credit_events_id_seq'::regclass);


--
-- Name: spree_store_credit_types id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.spree_store_credit_types ALTER COLUMN id SET DEFAULT nextval('public.spree_store_credit_types_id_seq'::regclass);


--
-- Name: spree_store_credits id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.spree_store_credits ALTER COLUMN id SET DEFAULT nextval('public.spree_store_credits_id_seq'::regclass);


--
-- Name: spree_stores id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.spree_stores ALTER COLUMN id SET DEFAULT nextval('public.spree_stores_id_seq'::regclass);


--
-- Name: spree_tax_categories id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.spree_tax_categories ALTER COLUMN id SET DEFAULT nextval('public.spree_tax_categories_id_seq'::regclass);


--
-- Name: spree_tax_rates id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.spree_tax_rates ALTER COLUMN id SET DEFAULT nextval('public.spree_tax_rates_id_seq'::regclass);


--
-- Name: spree_taxonomies id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.spree_taxonomies ALTER COLUMN id SET DEFAULT nextval('public.spree_taxonomies_id_seq'::regclass);


--
-- Name: spree_taxons id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.spree_taxons ALTER COLUMN id SET DEFAULT nextval('public.spree_taxons_id_seq'::regclass);


--
-- Name: spree_trackers id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.spree_trackers ALTER COLUMN id SET DEFAULT nextval('public.spree_trackers_id_seq'::regclass);


--
-- Name: spree_users id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.spree_users ALTER COLUMN id SET DEFAULT nextval('public.spree_users_id_seq'::regclass);


--
-- Name: spree_variants id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.spree_variants ALTER COLUMN id SET DEFAULT nextval('public.spree_variants_id_seq'::regclass);


--
-- Name: spree_webhooks_events id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.spree_webhooks_events ALTER COLUMN id SET DEFAULT nextval('public.spree_webhooks_events_id_seq'::regclass);


--
-- Name: spree_webhooks_subscribers id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.spree_webhooks_subscribers ALTER COLUMN id SET DEFAULT nextval('public.spree_webhooks_subscribers_id_seq'::regclass);


--
-- Name: spree_wished_items id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.spree_wished_items ALTER COLUMN id SET DEFAULT nextval('public.spree_wished_items_id_seq'::regclass);


--
-- Name: spree_wishlists id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.spree_wishlists ALTER COLUMN id SET DEFAULT nextval('public.spree_wishlists_id_seq'::regclass);


--
-- Name: spree_zone_members id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.spree_zone_members ALTER COLUMN id SET DEFAULT nextval('public.spree_zone_members_id_seq'::regclass);


--
-- Name: spree_zones id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.spree_zones ALTER COLUMN id SET DEFAULT nextval('public.spree_zones_id_seq'::regclass);


--
-- Data for Name: action_mailbox_inbound_emails; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.action_mailbox_inbound_emails (id, status, message_id, message_checksum, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: action_text_rich_texts; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.action_text_rich_texts (id, name, body, record_type, record_id, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: active_storage_attachments; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.active_storage_attachments (id, name, record_type, record_id, blob_id, created_at) FROM stdin;
1	attachment	Spree::Asset	1	1	2022-07-12 18:21:47.406351
2	image	ActiveStorage::VariantRecord	1	2	2022-07-12 18:21:49.007215
\.


--
-- Data for Name: active_storage_blobs; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.active_storage_blobs (id, key, filename, content_type, metadata, service_name, byte_size, checksum, created_at) FROM stdin;
1	k7hrw0msrvsspxi698amx5kmh2wg	tshirt1.webp	image/webp	{"identified":true,"width":550,"height":550,"analyzed":true}	local	7818	gdHiPmHbJtKciParA33KUA==	2022-07-12 18:21:47.40187
2	o5d9h8s1hih1gihezeeu73fgwa88	tshirt1.png	image/png	{"identified":true,"width":240,"height":240,"analyzed":true}	local	15720	4DjzOhPvmyWH2L6mFXTJ/A==	2022-07-12 18:21:49.001953
\.


--
-- Data for Name: active_storage_variant_records; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.active_storage_variant_records (id, blob_id, variation_digest) FROM stdin;
1	1	RkNOtddX8gz2EmUvtnjomvn0rac=
\.


--
-- Data for Name: ar_internal_metadata; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.ar_internal_metadata (key, value, created_at, updated_at) FROM stdin;
environment	development	2022-07-12 18:09:53.552384	2022-07-12 18:09:53.552384
\.


--
-- Data for Name: friendly_id_slugs; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.friendly_id_slugs (id, slug, sluggable_id, sluggable_type, scope, created_at, deleted_at) FROM stdin;
1	categories	1	Spree::Taxon	\N	2022-07-12 18:13:13.083664	\N
2	categories/men	2	Spree::Taxon	\N	2022-07-12 18:13:14.080667	\N
3	categories/women	3	Spree::Taxon	\N	2022-07-12 18:13:14.272231	\N
4	categories/sportswear	4	Spree::Taxon	\N	2022-07-12 18:13:14.523262	\N
5	categories/men/shirts	5	Spree::Taxon	\N	2022-07-12 18:13:14.68329	\N
6	categories/men/t-shirts	6	Spree::Taxon	\N	2022-07-12 18:13:14.786199	\N
7	categories/men/sweaters	7	Spree::Taxon	\N	2022-07-12 18:13:14.896758	\N
8	categories/men/jackets-and-coats	8	Spree::Taxon	\N	2022-07-12 18:13:15.007581	\N
9	categories/women/skirts	9	Spree::Taxon	\N	2022-07-12 18:13:15.113846	\N
10	categories/women/dresses	10	Spree::Taxon	\N	2022-07-12 18:13:15.2217	\N
11	categories/women/shirts-and-blouses	11	Spree::Taxon	\N	2022-07-12 18:13:15.332583	\N
12	categories/women/sweaters	12	Spree::Taxon	\N	2022-07-12 18:13:15.440709	\N
13	categories/women/tops-and-t-shirts	13	Spree::Taxon	\N	2022-07-12 18:13:15.544872	\N
14	categories/women/jackets-and-coats	14	Spree::Taxon	\N	2022-07-12 18:13:15.653372	\N
15	categories/sportswear/tops	15	Spree::Taxon	\N	2022-07-12 18:13:15.759122	\N
16	categories/sportswear/sweatshirts	16	Spree::Taxon	\N	2022-07-12 18:13:15.872582	\N
17	categories/sportswear/pants	17	Spree::Taxon	\N	2022-07-12 18:13:15.980192	\N
18	categories/new	18	Spree::Taxon	\N	2022-07-12 18:13:16.078291	\N
19	categories/bestsellers	19	Spree::Taxon	\N	2022-07-12 18:13:16.175428	\N
20	categories/trending	20	Spree::Taxon	\N	2022-07-12 18:13:16.278428	\N
21	categories/streetstyle	21	Spree::Taxon	\N	2022-07-12 18:13:16.38138	\N
22	categories/summer-sale	22	Spree::Taxon	\N	2022-07-12 18:13:16.481395	\N
23	categories/new-collection	23	Spree::Taxon	\N	2022-07-12 18:13:16.576708	\N
24	categories/new-collection/summer-2022	24	Spree::Taxon	\N	2022-07-12 18:13:16.677109	\N
25	categories/special-offers	25	Spree::Taxon	\N	2022-07-12 18:13:16.783992	\N
26	categories/special-offers/30-percent-off	26	Spree::Taxon	\N	2022-07-12 18:13:16.885386	\N
27	denim-shirt	1	Spree::Product	\N	2022-07-12 18:13:17.391548	\N
28	checked-shirt	2	Spree::Product	\N	2022-07-12 18:13:17.875797	\N
29	covered-placket-shirt	3	Spree::Product	\N	2022-07-12 18:13:18.212175	\N
30	slim-fit-shirt	4	Spree::Product	\N	2022-07-12 18:13:18.551534	\N
31	short-sleeve-shirt	5	Spree::Product	\N	2022-07-12 18:13:18.886327	\N
32	printed-short-sleeve-shirt	6	Spree::Product	\N	2022-07-12 18:13:19.225018	\N
33	regular-shirt	7	Spree::Product	\N	2022-07-12 18:13:19.566485	\N
34	checked-slim-fit-shirt	8	Spree::Product	\N	2022-07-12 18:13:19.902246	\N
35	dotted-shirt	9	Spree::Product	\N	2022-07-12 18:13:20.250901	\N
36	linen-shirt	10	Spree::Product	\N	2022-07-12 18:13:20.597271	\N
37	regular-shirt-with-rolled-up-sleeves	11	Spree::Product	\N	2022-07-12 18:13:20.921038	\N
38	polo-t-shirt	12	Spree::Product	\N	2022-07-12 18:13:21.257287	\N
39	long-sleeve-t-shirt	13	Spree::Product	\N	2022-07-12 18:13:21.593241	\N
40	3-4-sleeve-t-shirt	14	Spree::Product	\N	2022-07-12 18:13:21.937549	\N
41	t-shirt-with-holes	15	Spree::Product	\N	2022-07-12 18:13:22.284972	\N
42	raw-edge-t-shirt	16	Spree::Product	\N	2022-07-12 18:13:22.637858	\N
43	v-neck-t-shirt	17	Spree::Product	\N	2022-07-12 18:13:23.125292	\N
44	tank-top	18	Spree::Product	\N	2022-07-12 18:13:23.476906	\N
45	basic-t-shirt	19	Spree::Product	\N	2022-07-12 18:13:23.840223	\N
46	high-neck-sweater	20	Spree::Product	\N	2022-07-12 18:13:24.21039	\N
47	stripped-jumper	21	Spree::Product	\N	2022-07-12 18:13:24.56147	\N
48	long-sleeve-jumper-with-pocket	22	Spree::Product	\N	2022-07-12 18:13:24.918844	\N
49	jumper	23	Spree::Product	\N	2022-07-12 18:13:25.27837	\N
50	long-sleeve-sweatshirt	24	Spree::Product	\N	2022-07-12 18:13:25.619472	\N
51	hoodie	25	Spree::Product	\N	2022-07-12 18:13:26.059903	\N
52	zipped-high-neck-sweater	26	Spree::Product	\N	2022-07-12 18:13:26.437851	\N
53	long-sleeve-jumper	27	Spree::Product	\N	2022-07-12 18:13:26.796275	\N
54	suede-biker-jacket	28	Spree::Product	\N	2022-07-12 18:13:27.254036	\N
55	hooded-jacket	29	Spree::Product	\N	2022-07-12 18:13:27.656624	\N
56	anorak-with-hood	30	Spree::Product	\N	2022-07-12 18:13:28.064217	\N
57	denim-jacket	31	Spree::Product	\N	2022-07-12 18:13:28.498678	\N
58	wool-blend-short-coat	32	Spree::Product	\N	2022-07-12 18:13:28.998576	\N
59	down-jacket-with-hood	33	Spree::Product	\N	2022-07-12 18:13:29.374519	\N
60	wool-blend-coat	34	Spree::Product	\N	2022-07-12 18:13:29.724248	\N
61	jacket-with-liner	35	Spree::Product	\N	2022-07-12 18:13:30.092724	\N
62	flared-midi-skirt	36	Spree::Product	\N	2022-07-12 18:13:30.464192	\N
63	midi-skirt-with-bottoms	37	Spree::Product	\N	2022-07-12 18:13:30.823182	\N
64	fitted-skirt	38	Spree::Product	\N	2022-07-12 18:13:31.192728	\N
65	a-line-suede-skirt	39	Spree::Product	\N	2022-07-12 18:13:31.562211	\N
66	leather-skirt-with-lacing	40	Spree::Product	\N	2022-07-12 18:13:31.910474	\N
67	flared-skirt	41	Spree::Product	\N	2022-07-12 18:13:32.266387	\N
68	skater-skirt	42	Spree::Product	\N	2022-07-12 18:13:32.636966	\N
69	skater-short-skirt	43	Spree::Product	\N	2022-07-12 18:13:33.000338	\N
70	floral-flared-skirt	44	Spree::Product	\N	2022-07-12 18:13:33.367018	\N
71	pleated-skirt-2	45	Spree::Product	\N	2022-07-12 18:13:33.741768	\N
72	floral-wrap-dress	46	Spree::Product	\N	2022-07-12 18:13:34.267159	\N
73	v-neck-floral-maxi-dress	47	Spree::Product	\N	2022-07-12 18:13:34.648966	\N
74	flared-dress	48	Spree::Product	\N	2022-07-12 18:13:35.007832	\N
75	elegant-flared-dress	49	Spree::Product	\N	2022-07-12 18:13:35.36242	\N
76	long-sleeve-knitted-dress	50	Spree::Product	\N	2022-07-12 18:13:35.72999	\N
77	striped-shirt-dress	51	Spree::Product	\N	2022-07-12 18:13:36.104067	\N
78	printed-dress	52	Spree::Product	\N	2022-07-12 18:13:36.478442	\N
79	printed-slit-sleeves-dress	53	Spree::Product	\N	2022-07-12 18:13:36.843434	\N
80	dress-with-belt	54	Spree::Product	\N	2022-07-12 18:13:37.20395	\N
81	v-neck-floral-dress	55	Spree::Product	\N	2022-07-12 18:13:37.588042	\N
82	flounced-dress	56	Spree::Product	\N	2022-07-12 18:13:37.942049	\N
83	slit-maxi-dress	57	Spree::Product	\N	2022-07-12 18:13:38.296968	\N
84	semi-sheer-shirt-with-floral-cuffs	58	Spree::Product	\N	2022-07-12 18:13:38.637894	\N
85	striped-shirt	59	Spree::Product	\N	2022-07-12 18:13:38.984475	\N
86	v-neck-wide-shirt	60	Spree::Product	\N	2022-07-12 18:13:39.482443	\N
87	printed-wrapped-blouse	61	Spree::Product	\N	2022-07-12 18:13:39.831363	\N
88	pleated-sleeve-v-neck-shirt	62	Spree::Product	\N	2022-07-12 18:13:40.17749	\N
89	cotton-shirt	63	Spree::Product	\N	2022-07-12 18:13:40.519858	\N
90	blouse-with-wide-flounced-sleeve	64	Spree::Product	\N	2022-07-12 18:13:40.857366	\N
91	elegant-blouse-with-chocker	65	Spree::Product	\N	2022-07-12 18:13:41.235558	\N
92	floral-shirt	66	Spree::Product	\N	2022-07-12 18:13:41.583424	\N
93	semi-sheer-shirt-with-pockets	67	Spree::Product	\N	2022-07-12 18:13:41.953205	\N
94	v-neck-shirt	68	Spree::Product	\N	2022-07-12 18:13:42.329942	\N
95	printed-shirt	69	Spree::Product	\N	2022-07-12 18:13:42.727813	\N
96	asymmetric-sweater-with-wide-sleeves	70	Spree::Product	\N	2022-07-12 18:13:43.081179	\N
97	oversized-knitted-sweater	71	Spree::Product	\N	2022-07-12 18:13:43.435431	\N
98	oversized-sweatshirt	72	Spree::Product	\N	2022-07-12 18:13:43.788205	\N
99	knitted-high-neck-sweater	73	Spree::Product	\N	2022-07-12 18:13:44.174709	\N
100	knitted-v-neck-sweater	74	Spree::Product	\N	2022-07-12 18:13:44.56209	\N
101	cropped-fitted-sweater	75	Spree::Product	\N	2022-07-12 18:13:45.103196	\N
102	crop-top-with-tie	76	Spree::Product	\N	2022-07-12 18:13:45.515237	\N
103	printed-t-shirt	77	Spree::Product	\N	2022-07-12 18:13:46.039057	\N
104	scrappy-top	78	Spree::Product	\N	2022-07-12 18:13:46.678373	\N
105	pleated-sleeve-t-shirt	79	Spree::Product	\N	2022-07-12 18:13:47.128416	\N
106	scrappy-crop-top-with-tie	80	Spree::Product	\N	2022-07-12 18:13:47.481286	\N
107	crop-top	81	Spree::Product	\N	2022-07-12 18:13:47.838767	\N
108	loose-t-shirt-with-pocket-imitation	82	Spree::Product	\N	2022-07-12 18:13:48.187155	\N
109	sleeveless-loose-top	83	Spree::Product	\N	2022-07-12 18:13:48.562812	\N
110	basic-loose-t-shirt	84	Spree::Product	\N	2022-07-12 18:13:48.956844	\N
111	coat-with-pockets	85	Spree::Product	\N	2022-07-12 18:13:49.331533	\N
112	long-wool-blend-coat-with-belt	86	Spree::Product	\N	2022-07-12 18:13:49.685374	\N
113	asymmetric-coat	87	Spree::Product	\N	2022-07-12 18:13:50.069067	\N
114	long-coat-with-belt	88	Spree::Product	\N	2022-07-12 18:13:50.457509	\N
115	down-jacket	89	Spree::Product	\N	2022-07-12 18:13:50.996822	\N
116	zipped-jacket	90	Spree::Product	\N	2022-07-12 18:13:51.469815	\N
117	loose-fitted-jacket	91	Spree::Product	\N	2022-07-12 18:13:51.85172	\N
118	double-breasted-jacket	92	Spree::Product	\N	2022-07-12 18:13:52.344577	\N
119	leather-biker-jacket	93	Spree::Product	\N	2022-07-12 18:13:52.708819	\N
120	wool-blend-coat-with-belt	94	Spree::Product	\N	2022-07-12 18:13:53.105882	\N
121	denim-hooded-jacket	95	Spree::Product	\N	2022-07-12 18:13:53.472548	\N
122	bomber-jacket	96	Spree::Product	\N	2022-07-12 18:13:53.902506	\N
123	sports-bra-low-support	97	Spree::Product	\N	2022-07-12 18:13:54.256842	\N
124	long-sleeves-yoga-crop-top	98	Spree::Product	\N	2022-07-12 18:13:54.609189	\N
125	oversize-t-shirt-wrapped-on-back	99	Spree::Product	\N	2022-07-12 18:13:54.955027	\N
126	long-sleeves-crop-top	100	Spree::Product	\N	2022-07-12 18:13:55.308272	\N
127	laced-crop-top	101	Spree::Product	\N	2022-07-12 18:13:55.662217	\N
128	sports-bra-medium-support	102	Spree::Product	\N	2022-07-12 18:13:56.078907	\N
129	sports-bra	103	Spree::Product	\N	2022-07-12 18:13:56.47307	\N
130	sport-cropp-top	104	Spree::Product	\N	2022-07-12 18:13:56.965012	\N
131	running-sweatshirt	105	Spree::Product	\N	2022-07-12 18:13:57.350003	\N
132	lightweight-running-jacket	106	Spree::Product	\N	2022-07-12 18:13:57.718611	\N
133	oversize-sweatshirt	107	Spree::Product	\N	2022-07-12 18:13:58.092111	\N
134	sport-windproof-jacket	108	Spree::Product	\N	2022-07-12 18:13:58.451411	\N
135	sport-waistcoat	109	Spree::Product	\N	2022-07-12 18:13:58.844993	\N
136	shined-pants	110	Spree::Product	\N	2022-07-12 18:13:59.195099	\N
137	short-pants	111	Spree::Product	\N	2022-07-12 18:13:59.544369	\N
138	printed-pants-with-holes	112	Spree::Product	\N	2022-07-12 18:13:59.940315	\N
139	pants	113	Spree::Product	\N	2022-07-12 18:14:00.340149	\N
140	printed-pants	114	Spree::Product	\N	2022-07-12 18:14:00.781607	\N
141	high-waist-pants-with-pockets	115	Spree::Product	\N	2022-07-12 18:14:01.121957	\N
142	high-waist-pants	116	Spree::Product	\N	2022-07-12 18:14:01.470925	\N
\.


--
-- Data for Name: schema_migrations; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.schema_migrations (version) FROM stdin;
20211203185331
20211203185340
20211203185341
20211203185342
20211203185343
20211203185344
20211203185345
20211203185346
20211203185347
20211203185348
20211203185349
20211203185350
20211203185351
20211203185352
20211203185353
20211203185354
20211203185355
20211203185356
20211203185357
20211203185358
20211203185359
20211203185360
20211203185361
20211203185362
20211203185363
20211203185364
20211203185365
20211203185366
20211203185367
20211203185368
20211203185369
20211203185370
20211203185371
20211203185372
20211203185373
20211203185374
20211203185375
20211203185376
20211203185377
20211203185378
20211203185379
20211203185380
20211203185381
20211203185382
20211203185383
20211203185384
20211203185385
20211203185386
20211203185387
\.


--
-- Data for Name: spree_addresses; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.spree_addresses (id, firstname, lastname, address1, address2, city, zipcode, phone, state_name, alternative_phone, company, state_id, country_id, created_at, updated_at, user_id, deleted_at, label, public_metadata, private_metadata) FROM stdin;
1	Adele	Satterfield	04245 Earlene Extension	Suite 250	West Zadastad	16804	(778)684-6703 x261	\N	\N	\N	516	224	2022-07-12 18:13:09.456662	2022-07-12 18:13:09.456662	\N	\N	\N	\N	\N
2	Darla	Kub	214 Dara Fork	Apt. 821	Lake Lavinia	16804	922-854-2026 x1611	\N	\N	\N	516	224	2022-07-12 18:13:09.478497	2022-07-12 18:13:09.478497	\N	\N	\N	\N	\N
\.


--
-- Data for Name: spree_adjustments; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.spree_adjustments (id, source_type, source_id, adjustable_type, adjustable_id, amount, label, mandatory, eligible, created_at, updated_at, state, order_id, included) FROM stdin;
1	Spree::TaxRate	1	Spree::Order	1	2.50	Tax	t	t	2022-07-12 18:15:53.329841	2022-07-12 18:15:53.580333	open	1	f
2	Spree::TaxRate	1	Spree::Order	2	2.50	Tax	t	t	2022-07-12 18:15:53.394824	2022-07-12 18:15:53.83852	open	2	f
\.


--
-- Data for Name: spree_assets; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.spree_assets (id, viewable_type, viewable_id, attachment_width, attachment_height, attachment_file_size, "position", attachment_content_type, attachment_file_name, type, attachment_updated_at, alt, created_at, updated_at, public_metadata, private_metadata) FROM stdin;
1	Spree::Variant	14	\N	\N	\N	1	\N	\N	\N	\N		2022-07-12 18:21:47.373784	2022-07-12 18:21:47.411008	\N	\N
\.


--
-- Data for Name: spree_calculators; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.spree_calculators (id, type, calculable_type, calculable_id, created_at, updated_at, preferences, deleted_at) FROM stdin;
1	Spree::Calculator::Shipping::FlatRate	Spree::ShippingMethod	1	2022-07-12 18:13:10.104397	2022-07-12 18:13:10.315893	---\n:amount: 5\n:currency: USD\n	\N
4	Spree::Calculator::Shipping::FlatRate	Spree::ShippingMethod	4	2022-07-12 18:13:10.241184	2022-07-12 18:13:10.337498	---\n:amount: 5\n:currency: USD\n	\N
3	Spree::Calculator::Shipping::FlatRate	Spree::ShippingMethod	3	2022-07-12 18:13:10.206767	2022-07-12 18:13:10.369779	---\n:amount: 15\n:currency: USD\n	\N
2	Spree::Calculator::Shipping::FlatRate	Spree::ShippingMethod	2	2022-07-12 18:13:10.17193	2022-07-12 18:13:10.395073	---\n:amount: 10\n:currency: USD\n	\N
5	Spree::Calculator::Shipping::FlatRate	Spree::ShippingMethod	5	2022-07-12 18:13:10.276986	2022-07-12 18:13:10.417847	---\n:amount: 8\n:currency: EUR\n	\N
6	Spree::Calculator::DefaultTax	Spree::TaxRate	1	2022-07-12 18:13:10.495961	2022-07-12 18:13:10.510239	\N	\N
\.


--
-- Data for Name: spree_checks; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.spree_checks (id, payment_method_id, user_id, account_holder_name, account_holder_type, routing_number, account_number, account_type, status, last_digits, gateway_customer_profile_id, gateway_payment_profile_id, created_at, updated_at, deleted_at) FROM stdin;
\.


--
-- Data for Name: spree_cms_pages; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.spree_cms_pages (id, title, meta_title, content, meta_description, visible, slug, type, locale, deleted_at, store_id, created_at, updated_at) FROM stdin;
1	About Us	\N	Numquam cupiditate voluptatum quis excepturi dolorum eos. Officia magnam beatae consequuntur eum nobis dignissimos. In consequuntur assumenda possimus magnam praesentium eveniet blanditiis minus. Cumque quae laudantium tenetur animi rem impedit dolores. Eligendi illum dolorum et repellat. Laudantium vel tempore culpa officiis voluptates adipisci minus repellat. Consequatur voluptatum perferendis saepe dicta reprehenderit suscipit nisi ab. Accusantium facere quibusdam deleniti sint eum corrupti aperiam. Facilis asperiores debitis quis voluptatum aliquid exercitationem. Enim explicabo blanditiis facere dolorum.	\N	t	about-us	Spree::Cms::Pages::StandardPage	en	\N	1	2022-07-12 18:15:54.560263	2022-07-12 18:15:54.560263
2	Privacy Policy	\N	Perferendis praesentium reprehenderit veniam consectetur. Animi sequi excepturi eligendi rerum tempora molestiae. Sunt ea optio recusandae ad quam harum quaerat. Asperiores voluptatum inventore consequatur animi amet earum vitae sed. Quos aperiam quia tenetur animi. Possimus consequuntur excepturi vel iste ut atque odio blanditiis. Harum ullam hic animi tenetur molestias. Blanditiis optio cumque cum inventore. Dignissimos vitae eligendi dolor reprehenderit sunt mollitia culpa quod.	\N	t	privacy-policy	Spree::Cms::Pages::StandardPage	en	\N	1	2022-07-12 18:15:54.586117	2022-07-12 18:15:54.586117
3	Shipping Policy	\N	Quis suscipit consequatur tempora delectus commodi ipsa velit. Dignissimos laboriosam nam voluptates hic accusamus. Quos unde aperiam iusto illum corrupti. Similique blanditiis fugiat debitis corporis odio quia. Perferendis modi consequatur enim adipisci provident. Omnis eos non facere a nemo ad id praesentium. Blanditiis quaerat aperiam ea aliquid dolore. Quasi minus odit temporibus illum nostrum. Debitis ipsum nisi architecto recusandae. Ipsum delectus reprehenderit exercitationem ipsam officia magnam repellendus doloribus.	\N	t	shipping-policy	Spree::Cms::Pages::StandardPage	en	\N	1	2022-07-12 18:15:54.610922	2022-07-12 18:15:54.610922
4	Returns Policy	\N	Excepturi debitis iusto optio quae nemo iure animi repellendus. Aperiam inventore tenetur fuga sunt aut dolores ratione. Eos ullam voluptatum exercitationem excepturi. Eius mollitia quibusdam ipsam aut. Iste esse voluptates totam molestiae velit a labore. Incidunt architecto totam dolores amet laboriosam dignissimos dolorum. Itaque corrupti voluptatum dolore occaecati molestiae excepturi deleniti laborum. Occaecati alias aperiam reiciendis culpa voluptates.	\N	t	returns-policy	Spree::Cms::Pages::StandardPage	en	\N	1	2022-07-12 18:15:54.636864	2022-07-12 18:15:54.636864
5	À propos de nous	\N	Ab vero architecto dolorum fugiat. Deleniti quaerat minima doloribus fugit odit voluptatibus recusandae. Modi officiis accusamus mollitia neque illo placeat. Magnam veniam repellat animi quos. Ab laudantium eveniet at harum. Dolorem molestiae quaerat accusantium laboriosam aliquid in nesciunt. Consequatur recusandae optio quibusdam ullam omnis. Aliquid magni sed praesentium nisi. Magnam ad vel nesciunt beatae perferendis dignissimos praesentium ullam. Id nostrum incidunt voluptas repellendus hic culpa soluta veniam.	\N	t	a-propos-de-nous	Spree::Cms::Pages::StandardPage	fr	\N	1	2022-07-12 18:15:54.664297	2022-07-12 18:15:54.664297
6	Politique de confidentialité	\N	Delectus est consequuntur totam unde. Repellat neque sit eos consequatur. Illo tempore illum ratione ducimus maxime. Repellendus odio suscipit ipsam magni laborum quam. Magni veniam voluptates dolorum illum voluptatibus qui veritatis iure. Laboriosam assumenda debitis repellat vel voluptatibus. Ad eveniet qui in saepe cumque. Nesciunt vitae inventore aspernatur amet distinctio optio quam.	\N	t	politique-de-confidentialite	Spree::Cms::Pages::StandardPage	fr	\N	1	2022-07-12 18:15:54.687268	2022-07-12 18:15:54.687268
7	Politique d'expédition	\N	Natus sequi mollitia incidunt libero quo neque. Repellat a nulla accusamus maiores dolorum enim. Vero corrupti earum reiciendis iure nesciunt debitis. Magni consectetur quibusdam odio nulla deleniti. In ab tempora excepturi nulla sunt. Vero ipsum placeat omnis nemo esse occaecati unde. Veniam dolores blanditiis suscipit laborum doloribus non quas debitis. Quibusdam doloremque amet impedit recusandae fugiat beatae magni porro. Quos cum dignissimos aliquid quasi nam voluptatem. Labore magni quae dolor dolorem.	\N	t	politique-dexpedition	Spree::Cms::Pages::StandardPage	fr	\N	1	2022-07-12 18:15:54.711129	2022-07-12 18:15:54.711129
8	Politique de retour	\N	Dolore minus natus delectus eaque. Quam sapiente facilis possimus neque voluptatem ipsa molestias nobis. Deleniti accusantium animi dolor veniam. Sequi libero in dolorem expedita modi iste tenetur. Quam expedita unde dignissimos exercitationem. Architecto accusantium dolorum explicabo vel numquam illum. Earum iusto vero amet doloremque. Illum nobis voluptate maiores ad delectus suscipit quibusdam. Amet consequatur iste asperiores cupiditate. Quisquam atque porro temporibus officia laudantium facere nulla eius.	\N	t	politique-de-retour	Spree::Cms::Pages::StandardPage	fr	\N	1	2022-07-12 18:15:54.734712	2022-07-12 18:15:54.734712
9	Über uns	\N	Assumenda fugiat maiores voluptates et ipsa exercitationem inventore provident. Facilis amet a id veritatis repellendus ad nostrum perferendis. Id deserunt fugit tempora delectus reiciendis neque doloribus culpa. Modi ducimus voluptatem eaque doloribus molestiae consequatur error. Vel blanditiis illum quam distinctio aut aperiam. Quia repudiandae totam officiis unde possimus et. Temporibus facere dicta tempore in est ut. Temporibus error velit soluta possimus ratione fugit. Incidunt veniam ipsa error molestiae.	\N	t	uber-uns	Spree::Cms::Pages::StandardPage	de	\N	2	2022-07-12 18:15:54.758315	2022-07-12 18:15:54.758315
10	Datenschutz-Bestimmungen	\N	Hic rerum cumque unde cum. Nulla delectus porro nisi tempore laudantium. Asperiores corporis quibusdam praesentium libero. Ea beatae ab blanditiis vitae rem aut consectetur libero. Repellendus odit eos mollitia impedit officiis tempora. Maxime consequatur placeat laborum eum odit voluptates. Rerum a dolor pariatur veritatis neque esse. Libero veniam saepe modi officiis minus odio.	\N	t	datenschutz-bestimmungen	Spree::Cms::Pages::StandardPage	de	\N	2	2022-07-12 18:15:54.780969	2022-07-12 18:15:54.780969
11	Versandbedingungen	\N	Est quos illo quas hic natus iure velit animi. Blanditiis aspernatur repudiandae illum necessitatibus quibusdam. Nobis facere quaerat aliquid alias fuga. Voluptas omnis ducimus laboriosam voluptates ex asperiores nam fugit. Officiis illum omnis nesciunt nemo dolorem. Fugiat nesciunt eveniet totam cumque laudantium. Velit modi quaerat laudantium distinctio officia iusto dolores. Necessitatibus earum doloremque sapiente consectetur.	\N	t	versandbedingungen	Spree::Cms::Pages::StandardPage	de	\N	2	2022-07-12 18:15:54.804449	2022-07-12 18:15:54.804449
12	Rückgaberecht	\N	Aliquid accusamus sequi explicabo totam error. Facilis maxime eveniet sapiente ipsam nemo tenetur. Iusto porro necessitatibus beatae numquam cumque. Illum nesciunt cupiditate corrupti hic ducimus voluptatum aut odio. Porro id magni ipsam voluptatibus voluptates. Culpa quos beatae aliquam quibusdam corporis rem et. Odit dolorem enim praesentium esse ratione officia. Fugiat maxime alias consectetur placeat doloremque deserunt. Minus harum doloribus id maxime eveniet eius quisquam. Error nostrum veritatis architecto facere voluptatem optio aperiam.	\N	t	ruckgaberecht	Spree::Cms::Pages::StandardPage	de	\N	2	2022-07-12 18:15:54.82804	2022-07-12 18:15:54.82804
30	Feature Page	\N	\N	\N	t	feature-page	Spree::Cms::Pages::FeaturePage	en	\N	3	2022-07-12 18:15:55.296624	2022-07-12 18:15:58.584345
31	Homepage (English)	\N	\N	\N	t	\N	Spree::Cms::Pages::Homepage	en	\N	1	2022-07-12 18:15:55.337838	2022-07-12 18:15:58.63349
13	Sobre nosotros	\N	Tenetur error minima nam tempora sit voluptates nesciunt perferendis. Neque maiores nemo tempora eaque dolore odio fugit impedit. Saepe consectetur aliquam alias nesciunt nostrum quam ratione delectus. Minima veniam placeat explicabo accusamus cum voluptatum officiis. Aspernatur ipsam fugiat impedit placeat error nihil exercitationem pariatur. Recusandae voluptatibus et assumenda modi odit ipsum veniam nam. Magnam laborum iusto dolorem hic veniam magni quod commodi. Vel numquam doloremque soluta aspernatur. Possimus dolor minus inventore architecto.	\N	t	sobre-nosotros	Spree::Cms::Pages::StandardPage	es	\N	2	2022-07-12 18:15:54.850831	2022-07-12 18:15:54.850831
14	Política de privacidad	\N	Recusandae perspiciatis a quo occaecati laudantium exercitationem ratione. Quas ipsam assumenda distinctio occaecati. Id sapiente laboriosam libero assumenda unde perferendis. Esse cum error nisi minus officiis. Laborum deleniti necessitatibus ipsam repellat dolorum eaque. Est at vel tempore fugiat adipisci animi. Perferendis totam recusandae voluptas quidem. Odit error quae consequuntur iusto ea itaque. Temporibus voluptatem iusto delectus itaque quia quo. Blanditiis ratione illum quasi ex corrupti officiis libero.	\N	t	politica-de-privacidad	Spree::Cms::Pages::StandardPage	es	\N	2	2022-07-12 18:15:54.889774	2022-07-12 18:15:54.889774
15	Politica de envios	\N	Vitae at adipisci quasi provident temporibus odio. Est sapiente suscipit consequuntur optio perferendis. Libero repellat natus eius ducimus amet explicabo. Illo ducimus blanditiis quae quasi eum mollitia provident. Suscipit ipsum inventore consequatur ullam voluptatum unde ducimus. Accusamus adipisci omnis impedit eos. Illum consectetur quo culpa aperiam assumenda ipsum cupiditate. Hic quaerat fugit quia tenetur perferendis rerum perspiciatis.	\N	t	politica-de-envios	Spree::Cms::Pages::StandardPage	es	\N	2	2022-07-12 18:15:54.915987	2022-07-12 18:15:54.915987
16	Política de devoluciones	\N	Iste ipsam quaerat corrupti impedit doloremque repellendus itaque fugiat. Quibusdam in quo maxime architecto repudiandae voluptas. Impedit corrupti eius quia tenetur. Culpa magnam cum temporibus ipsa beatae recusandae. Nihil rerum sequi eaque reiciendis repellendus praesentium perspiciatis veritatis. Hic cupiditate libero blanditiis eum aperiam eveniet animi. Nemo quibusdam sapiente consequatur voluptates minus nihil. Cumque quis ex odio iste enim impedit soluta aut. Blanditiis tenetur corporis quod commodi minima. Dolorum suscipit enim saepe quas dolore.	\N	t	politica-de-devoluciones	Spree::Cms::Pages::StandardPage	es	\N	2	2022-07-12 18:15:54.940717	2022-07-12 18:15:54.940717
17	À propos de nous	\N	Sit aspernatur expedita amet veritatis quia iure exercitationem unde. Voluptas tempore veniam unde molestiae praesentium eum modi. Voluptatum libero inventore accusamus ipsa in labore vero. Deserunt nobis expedita nihil totam eveniet quia eum. Eveniet deleniti hic rem reprehenderit id. Eveniet tempore commodi consectetur vel autem. Facere at similique doloribus accusantium commodi tenetur nam sunt. Provident consectetur eum dolorem vero non aliquam harum.	\N	t	a-propos-de-nous	Spree::Cms::Pages::StandardPage	fr	\N	2	2022-07-12 18:15:54.965114	2022-07-12 18:15:54.965114
18	Politique de confidentialité	\N	Voluptates inventore molestias magni consequatur temporibus esse. Assumenda maiores beatae numquam nam fugit at. Placeat quidem accusantium error voluptatum fuga blanditiis ab. Perferendis dignissimos magni dolorum laborum facilis aspernatur minus. Perspiciatis fugiat quas iusto id error cumque. Reiciendis repudiandae porro dolore amet aperiam minus repellat mollitia. Ab fugit quia dolor eveniet quidem. Officia eveniet labore aut illo. Ipsa voluptatem dolore ab quo esse assumenda.	\N	t	politique-de-confidentialite	Spree::Cms::Pages::StandardPage	fr	\N	2	2022-07-12 18:15:54.989845	2022-07-12 18:15:54.989845
19	Politique d'expédition	\N	Deleniti qui cupiditate totam hic. Voluptatem voluptas autem praesentium sunt beatae amet. Deserunt ullam delectus totam hic culpa repellat placeat. Laboriosam animi recusandae accusamus commodi. Totam quis et vel incidunt veniam molestiae aliquid. Unde dolore quam sapiente omnis perferendis nulla in. Perferendis maxime quasi ex eum saepe incidunt. Voluptates repellendus aperiam ipsam totam debitis facere. Fugiat quas consectetur exercitationem illum eos cumque dignissimos aspernatur. Perspiciatis ad ipsam est impedit nemo expedita.	\N	t	politique-dexpedition	Spree::Cms::Pages::StandardPage	fr	\N	2	2022-07-12 18:15:55.013195	2022-07-12 18:15:55.013195
20	Politique de retour	\N	Possimus maxime est necessitatibus similique quas temporibus quibusdam pariatur. Quos odio maiores cupiditate labore atque. Aliquam eum vitae ullam quidem fugiat voluptatibus iure. Facilis cupiditate modi pariatur eius reiciendis. Sint cumque maxime sed ullam velit vitae. Tempora commodi fugit velit aspernatur. Repellat cupiditate vel voluptates occaecati. Magnam possimus placeat reiciendis voluptas ea odio consequatur voluptatibus.	\N	t	politique-de-retour	Spree::Cms::Pages::StandardPage	fr	\N	2	2022-07-12 18:15:55.036933	2022-07-12 18:15:55.036933
21	About Us	\N	Consequuntur omnis sunt tenetur iusto quia quisquam quaerat cumque. Perspiciatis magnam maiores beatae incidunt quaerat quasi voluptatum. Veritatis exercitationem explicabo rerum eveniet hic soluta eligendi sapiente. Error sint reprehenderit consectetur commodi voluptas mollitia. Repudiandae nisi explicabo ullam voluptates. Minus iusto quas ipsam doloremque amet reiciendis. Rem illum aspernatur animi ex quis. Nisi recusandae quibusdam officia ex animi.	\N	t	about-us	Spree::Cms::Pages::StandardPage	en	\N	3	2022-07-12 18:15:55.060692	2022-07-12 18:15:55.060692
22	Privacy Policy	\N	Aliquid eius quaerat tenetur sint optio. Sint labore harum sed minima quas iusto rem. In hic officia corporis enim sapiente. Magni quas at dicta aperiam iusto quam inventore nostrum. Voluptatem minus alias impedit quaerat illum labore ab. Doloribus laboriosam iusto laborum saepe ut voluptatibus. Rem minima itaque quae maiores quis. Sunt ullam praesentium commodi delectus nostrum dolore deserunt. Harum perspiciatis eligendi qui molestias. Qui eaque non id illo inventore aut architecto.	\N	t	privacy-policy	Spree::Cms::Pages::StandardPage	en	\N	3	2022-07-12 18:15:55.084057	2022-07-12 18:15:55.084057
23	Shipping Policy	\N	Maxime a velit placeat quidem consequatur veniam. Dolores aut sequi sed doloremque fuga debitis. Vitae nulla ipsa debitis reprehenderit. Qui laborum ad vel soluta ratione quae pariatur. Doloremque cupiditate veritatis sapiente ea amet sit. Blanditiis est sapiente aperiam deserunt. Harum quis perferendis autem quidem cumque ab officiis at. Quam atque rem quo incidunt nulla praesentium dicta ipsam.	\N	t	shipping-policy	Spree::Cms::Pages::StandardPage	en	\N	3	2022-07-12 18:15:55.107639	2022-07-12 18:15:55.107639
24	Returns Policy	\N	Nemo quibusdam adipisci ipsam sunt possimus nulla. Distinctio assumenda consequatur ab quam. Facere quo ipsam veniam dignissimos doloremque. Incidunt quod vel hic doloribus magnam mollitia numquam quisquam. Illum vel hic dolor distinctio fugit quibusdam consectetur vitae. At minus fugiat rerum tempora. Corrupti cupiditate dolore adipisci ea quo quae. Id blanditiis harum facere fugiat.	\N	t	returns-policy	Spree::Cms::Pages::StandardPage	en	\N	3	2022-07-12 18:15:55.133015	2022-07-12 18:15:55.133015
26	Page de fonctionnalité	\N	\N	\N	t	page-de-fonctionnalite	Spree::Cms::Pages::FeaturePage	fr	\N	1	2022-07-12 18:15:55.202656	2022-07-12 18:15:58.730069
27	Feature-Seite	\N	\N	\N	t	feature-seite	Spree::Cms::Pages::FeaturePage	de	\N	2	2022-07-12 18:15:55.22675	2022-07-12 18:15:58.777897
28	Página de características	\N	\N	\N	t	pagina-de-caracteristicas	Spree::Cms::Pages::FeaturePage	es	\N	2	2022-07-12 18:15:55.250857	2022-07-12 18:15:58.825561
29	Page de fonctionnalité	\N	\N	\N	t	page-de-fonctionnalite	Spree::Cms::Pages::FeaturePage	fr	\N	2	2022-07-12 18:15:55.273745	2022-07-12 18:15:58.537818
25	Feature Page	\N	\N	\N	t	feature-page	Spree::Cms::Pages::FeaturePage	en	\N	1	2022-07-12 18:15:55.17607	2022-07-12 18:15:58.682065
32	Page d'accueil (Français)	\N	\N	\N	t	\N	Spree::Cms::Pages::Homepage	fr	\N	1	2022-07-12 18:15:55.362441	2022-07-12 18:15:58.870774
33	Startseite (Deutsche)	\N	\N	\N	t	\N	Spree::Cms::Pages::Homepage	de	\N	2	2022-07-12 18:15:55.384683	2022-07-12 18:15:58.91885
34	Página principal (Español)	\N	\N	\N	t	\N	Spree::Cms::Pages::Homepage	es	\N	2	2022-07-12 18:15:55.407121	2022-07-12 18:15:58.970005
35	Page d'accueil (Français)	\N	\N	\N	t	\N	Spree::Cms::Pages::Homepage	fr	\N	2	2022-07-12 18:15:55.428994	2022-07-12 18:15:59.019988
36	Homepage (English)	\N	\N	\N	t	\N	Spree::Cms::Pages::Homepage	en	\N	3	2022-07-12 18:15:55.450192	2022-07-12 18:15:59.069959
\.


--
-- Data for Name: spree_cms_sections; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.spree_cms_sections (id, name, content, settings, fit, destination, type, "position", linked_resource_type, linked_resource_id, cms_page_id, created_at, updated_at) FROM stdin;
1	Image de héros	{"title":"Collection d'été","button_text":"Achetez maintenant"}	{"gutters":"No Gutters"}	Screen	\N	Spree::Cms::Sections::HeroImage	1	Spree::Taxon	24	29	2022-07-12 18:15:55.52107	2022-07-12 18:15:55.545821
2	Hero Image	{"title":"Summer Collection","button_text":"Shop Now"}	{"gutters":"No Gutters"}	Screen	\N	Spree::Cms::Sections::HeroImage	1	Spree::Taxon	24	30	2022-07-12 18:15:55.573302	2022-07-12 18:15:55.595191
3	Hero Image	{"title":"Summer Collection","button_text":"Shop Now"}	{"gutters":"No Gutters"}	Screen	\N	Spree::Cms::Sections::HeroImage	1	Spree::Taxon	24	31	2022-07-12 18:15:55.620585	2022-07-12 18:15:55.642242
4	Hero Image	{"title":"Summer Collection","button_text":"Shop Now"}	{"gutters":"No Gutters"}	Screen	\N	Spree::Cms::Sections::HeroImage	1	Spree::Taxon	24	25	2022-07-12 18:15:55.667202	2022-07-12 18:15:55.689382
5	Image de héros	{"title":"Collection d'été","button_text":"Achetez maintenant"}	{"gutters":"No Gutters"}	Screen	\N	Spree::Cms::Sections::HeroImage	1	Spree::Taxon	24	26	2022-07-12 18:15:55.715811	2022-07-12 18:15:55.737806
6	Heldenbild	{"title":"Sommerkollektion","button_text":"Jetzt einkaufen"}	{"gutters":"No Gutters"}	Screen	\N	Spree::Cms::Sections::HeroImage	1	Spree::Taxon	24	27	2022-07-12 18:15:55.763014	2022-07-12 18:15:55.78468
7	Imagen de héroe	{"title":"Colección de verano","button_text":"Compra ahora"}	{"gutters":"No Gutters"}	Screen	\N	Spree::Cms::Sections::HeroImage	1	Spree::Taxon	24	28	2022-07-12 18:15:55.809817	2022-07-12 18:15:55.831323
8	Image de héros	{"title":"Collection d'été","button_text":"Achetez maintenant"}	{"gutters":"No Gutters"}	Screen	\N	Spree::Cms::Sections::HeroImage	1	Spree::Taxon	24	32	2022-07-12 18:15:55.856691	2022-07-12 18:15:55.878194
9	Heldenbild	{"title":"Sommerkollektion","button_text":"Jetzt einkaufen"}	{"gutters":"No Gutters"}	Screen	\N	Spree::Cms::Sections::HeroImage	1	Spree::Taxon	24	33	2022-07-12 18:15:55.904474	2022-07-12 18:15:55.935383
10	Imagen de héroe	{"title":"Colección de verano","button_text":"Compra ahora"}	{"gutters":"No Gutters"}	Screen	\N	Spree::Cms::Sections::HeroImage	1	Spree::Taxon	24	34	2022-07-12 18:15:55.962148	2022-07-12 18:15:55.984702
11	Image de héros	{"title":"Collection d'été","button_text":"Achetez maintenant"}	{"gutters":"No Gutters"}	Screen	\N	Spree::Cms::Sections::HeroImage	1	Spree::Taxon	24	35	2022-07-12 18:15:56.009291	2022-07-12 18:15:56.031215
12	Hero Image	{"title":"Summer Collection","button_text":"Shop Now"}	{"gutters":"No Gutters"}	Screen	\N	Spree::Cms::Sections::HeroImage	1	Spree::Taxon	24	36	2022-07-12 18:15:56.056942	2022-07-12 18:15:56.079635
13	Main Taxons	{"link_type_one":"Spree::Taxon","link_type_two":"Spree::Taxon","link_type_three":"Spree::Taxon","link_one":"categories/men","link_two":"categories/women","link_three":"categories/sportswear","title_one":"Hommes","title_two":"Femmes","title_three":"Tenue de sport"}	{"layout_style":"Default"}	Container	\N	Spree::Cms::Sections::ImageGallery	2	\N	\N	29	2022-07-12 18:15:56.117329	2022-07-12 18:15:56.1696
14	Main Taxons	{"link_type_one":"Spree::Taxon","link_type_two":"Spree::Taxon","link_type_three":"Spree::Taxon","link_one":"categories/men","link_two":"categories/women","link_three":"categories/sportswear","title_one":"Men","title_two":"Women","title_three":"Sportswear"}	{"layout_style":"Default"}	Container	\N	Spree::Cms::Sections::ImageGallery	2	\N	\N	30	2022-07-12 18:15:56.194408	2022-07-12 18:15:56.216213
15	Main Taxons	{"link_type_one":"Spree::Taxon","link_type_two":"Spree::Taxon","link_type_three":"Spree::Taxon","link_one":"categories/men","link_two":"categories/women","link_three":"categories/sportswear","title_one":"Men","title_two":"Women","title_three":"Sportswear"}	{"layout_style":"Default"}	Container	\N	Spree::Cms::Sections::ImageGallery	2	\N	\N	31	2022-07-12 18:15:56.240559	2022-07-12 18:15:56.261829
16	Main Taxons	{"link_type_one":"Spree::Taxon","link_type_two":"Spree::Taxon","link_type_three":"Spree::Taxon","link_one":"categories/men","link_two":"categories/women","link_three":"categories/sportswear","title_one":"Men","title_two":"Women","title_three":"Sportswear"}	{"layout_style":"Default"}	Container	\N	Spree::Cms::Sections::ImageGallery	2	\N	\N	25	2022-07-12 18:15:56.285505	2022-07-12 18:15:56.308319
17	Main Taxons	{"link_type_one":"Spree::Taxon","link_type_two":"Spree::Taxon","link_type_three":"Spree::Taxon","link_one":"categories/men","link_two":"categories/women","link_three":"categories/sportswear","title_one":"Hommes","title_two":"Femmes","title_three":"Tenue de sport"}	{"layout_style":"Default"}	Container	\N	Spree::Cms::Sections::ImageGallery	2	\N	\N	26	2022-07-12 18:15:56.333669	2022-07-12 18:15:56.356077
18	Haupttaxa	{"link_type_one":"Spree::Taxon","link_type_two":"Spree::Taxon","link_type_three":"Spree::Taxon","link_one":"categories/men","link_two":"categories/women","link_three":"categories/sportswear","title_one":"Männer","title_two":"Frauen","title_three":"Sportbekleidung"}	{"layout_style":"Default"}	Container	\N	Spree::Cms::Sections::ImageGallery	2	\N	\N	27	2022-07-12 18:15:56.379835	2022-07-12 18:15:56.402265
19	Taxón principal	{"link_type_one":"Spree::Taxon","link_type_two":"Spree::Taxon","link_type_three":"Spree::Taxon","link_one":"categories/men","link_two":"categories/women","link_three":"categories/sportswear","title_one":"Hombres","title_two":"Mujeres","title_three":"Ropa de deporte"}	{"layout_style":"Default"}	Container	\N	Spree::Cms::Sections::ImageGallery	2	\N	\N	28	2022-07-12 18:15:56.425491	2022-07-12 18:15:56.447825
20	Main Taxons	{"link_type_one":"Spree::Taxon","link_type_two":"Spree::Taxon","link_type_three":"Spree::Taxon","link_one":"categories/men","link_two":"categories/women","link_three":"categories/sportswear","title_one":"Hommes","title_two":"Femmes","title_three":"Tenue de sport"}	{"layout_style":"Default"}	Container	\N	Spree::Cms::Sections::ImageGallery	2	\N	\N	32	2022-07-12 18:15:56.471758	2022-07-12 18:15:56.494202
21	Haupttaxa	{"link_type_one":"Spree::Taxon","link_type_two":"Spree::Taxon","link_type_three":"Spree::Taxon","link_one":"categories/men","link_two":"categories/women","link_three":"categories/sportswear","title_one":"Männer","title_two":"Frauen","title_three":"Sportbekleidung"}	{"layout_style":"Default"}	Container	\N	Spree::Cms::Sections::ImageGallery	2	\N	\N	33	2022-07-12 18:15:56.518188	2022-07-12 18:15:56.540731
22	Taxón principal	{"link_type_one":"Spree::Taxon","link_type_two":"Spree::Taxon","link_type_three":"Spree::Taxon","link_one":"categories/men","link_two":"categories/women","link_three":"categories/sportswear","title_one":"Hombres","title_two":"Mujeres","title_three":"Ropa de deporte"}	{"layout_style":"Default"}	Container	\N	Spree::Cms::Sections::ImageGallery	2	\N	\N	34	2022-07-12 18:15:56.564825	2022-07-12 18:15:56.585697
23	Main Taxons	{"link_type_one":"Spree::Taxon","link_type_two":"Spree::Taxon","link_type_three":"Spree::Taxon","link_one":"categories/men","link_two":"categories/women","link_three":"categories/sportswear","title_one":"Hommes","title_two":"Femmes","title_three":"Tenue de sport"}	{"layout_style":"Default"}	Container	\N	Spree::Cms::Sections::ImageGallery	2	\N	\N	35	2022-07-12 18:15:56.60759	2022-07-12 18:15:56.629302
24	Main Taxons	{"link_type_one":"Spree::Taxon","link_type_two":"Spree::Taxon","link_type_three":"Spree::Taxon","link_one":"categories/men","link_two":"categories/women","link_three":"categories/sportswear","title_one":"Men","title_two":"Women","title_three":"Sportswear"}	{"layout_style":"Default"}	Container	\N	Spree::Cms::Sections::ImageGallery	2	\N	\N	36	2022-07-12 18:15:56.65259	2022-07-12 18:15:56.673811
25	Carrousel des meilleures ventes	\N	\N	Screen	\N	Spree::Cms::Sections::ProductCarousel	3	Spree::Taxon	19	29	2022-07-12 18:15:56.711287	2022-07-12 18:15:56.734269
26	Best Sellers Carousel	\N	\N	Screen	\N	Spree::Cms::Sections::ProductCarousel	3	Spree::Taxon	19	30	2022-07-12 18:15:56.758921	2022-07-12 18:15:56.779991
27	Best Sellers Carousel	\N	\N	Screen	\N	Spree::Cms::Sections::ProductCarousel	3	Spree::Taxon	19	31	2022-07-12 18:15:56.804631	2022-07-12 18:15:56.828049
28	Best Sellers Carousel	\N	\N	Screen	\N	Spree::Cms::Sections::ProductCarousel	3	Spree::Taxon	19	25	2022-07-12 18:15:56.853111	2022-07-12 18:15:56.874961
29	Carrousel des meilleures ventes	\N	\N	Screen	\N	Spree::Cms::Sections::ProductCarousel	3	Spree::Taxon	19	26	2022-07-12 18:15:56.89901	2022-07-12 18:15:56.920741
30	Bestseller Karussell	\N	\N	Screen	\N	Spree::Cms::Sections::ProductCarousel	3	Spree::Taxon	19	27	2022-07-12 18:15:56.944375	2022-07-12 18:15:56.966003
31	Carrusel de los más vendidos	\N	\N	Screen	\N	Spree::Cms::Sections::ProductCarousel	3	Spree::Taxon	19	28	2022-07-12 18:15:56.990451	2022-07-12 18:15:57.020058
32	Carrousel des meilleures ventes	\N	\N	Screen	\N	Spree::Cms::Sections::ProductCarousel	3	Spree::Taxon	19	32	2022-07-12 18:15:57.046935	2022-07-12 18:15:57.069233
33	Bestseller Karussell	\N	\N	Screen	\N	Spree::Cms::Sections::ProductCarousel	3	Spree::Taxon	19	33	2022-07-12 18:15:57.093448	2022-07-12 18:15:57.114807
34	Carrusel de los más vendidos	\N	\N	Screen	\N	Spree::Cms::Sections::ProductCarousel	3	Spree::Taxon	19	34	2022-07-12 18:15:57.139868	2022-07-12 18:15:57.16093
35	Carrousel des meilleures ventes	\N	\N	Screen	\N	Spree::Cms::Sections::ProductCarousel	3	Spree::Taxon	19	35	2022-07-12 18:15:57.18608	2022-07-12 18:15:57.209135
36	Best Sellers Carousel	\N	\N	Screen	\N	Spree::Cms::Sections::ProductCarousel	3	Spree::Taxon	19	36	2022-07-12 18:15:57.233276	2022-07-12 18:15:57.255589
37	Tendances de la mode	{"title":"Été 2022","subtitle":"Tendances de la mode","button_text":"Lire la suite","rte_content":"<div style=\\"text-center\\">Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam.</div>"}	{"gutters":"No Gutters"}	Screen	\N	Spree::Cms::Sections::FeaturedArticle	4	Spree::Taxon	20	29	2022-07-12 18:15:57.295483	2022-07-12 18:15:57.318458
38	Fashion Trends	{"title":"Summer 2022","subtitle":"Fashion Trends","button_text":"Read More","rte_content":"<div style=\\"text-center\\">Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam.</div>"}	{"gutters":"No Gutters"}	Screen	\N	Spree::Cms::Sections::FeaturedArticle	4	Spree::Taxon	20	30	2022-07-12 18:15:57.344942	2022-07-12 18:15:57.36682
39	Fashion Trends	{"title":"Summer 2022","subtitle":"Fashion Trends","button_text":"Read More","rte_content":"<div style=\\"text-center\\">Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam.</div>"}	{"gutters":"No Gutters"}	Screen	\N	Spree::Cms::Sections::FeaturedArticle	4	Spree::Taxon	20	31	2022-07-12 18:15:57.393743	2022-07-12 18:15:57.415078
40	Fashion Trends	{"title":"Summer 2022","subtitle":"Fashion Trends","button_text":"Read More","rte_content":"<div style=\\"text-center\\">Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam.</div>"}	{"gutters":"No Gutters"}	Screen	\N	Spree::Cms::Sections::FeaturedArticle	4	Spree::Taxon	20	25	2022-07-12 18:15:57.440226	2022-07-12 18:15:57.462772
41	Tendances de la mode	{"title":"Été 2022","subtitle":"Tendances de la mode","button_text":"Lire la suite","rte_content":"<div style=\\"text-center\\">Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam.</div>"}	{"gutters":"No Gutters"}	Screen	\N	Spree::Cms::Sections::FeaturedArticle	4	Spree::Taxon	20	26	2022-07-12 18:15:57.488024	2022-07-12 18:15:57.509922
42	Modetrends	{"title":"Sommer 2022","subtitle":"Modetrends","button_text":"Weiterlesen","rte_content":"<div style=\\"text-center\\">Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam.</div>"}	{"gutters":"No Gutters"}	Screen	\N	Spree::Cms::Sections::FeaturedArticle	4	Spree::Taxon	20	27	2022-07-12 18:15:57.542908	2022-07-12 18:15:57.566165
43	Tendencias de la moda	{"title":"Verano 2022","subtitle":"Tendencias de la moda","button_text":"Lee mas","rte_content":"<div style=\\"text-center\\">Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam.</div>"}	{"gutters":"No Gutters"}	Screen	\N	Spree::Cms::Sections::FeaturedArticle	4	Spree::Taxon	20	28	2022-07-12 18:15:57.591569	2022-07-12 18:15:57.612986
44	Tendances de la mode	{"title":"Été 2022","subtitle":"Tendances de la mode","button_text":"Lire la suite","rte_content":"<div style=\\"text-center\\">Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam.</div>"}	{"gutters":"No Gutters"}	Screen	\N	Spree::Cms::Sections::FeaturedArticle	4	Spree::Taxon	20	32	2022-07-12 18:15:57.637931	2022-07-12 18:15:57.658399
45	Modetrends	{"title":"Sommer 2022","subtitle":"Modetrends","button_text":"Weiterlesen","rte_content":"<div style=\\"text-center\\">Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam.</div>"}	{"gutters":"No Gutters"}	Screen	\N	Spree::Cms::Sections::FeaturedArticle	4	Spree::Taxon	20	33	2022-07-12 18:15:57.68353	2022-07-12 18:15:57.704781
46	Tendencias de la moda	{"title":"Verano 2022","subtitle":"Tendencias de la moda","button_text":"Lee mas","rte_content":"<div style=\\"text-center\\">Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam.</div>"}	{"gutters":"No Gutters"}	Screen	\N	Spree::Cms::Sections::FeaturedArticle	4	Spree::Taxon	20	34	2022-07-12 18:15:57.730615	2022-07-12 18:15:57.752067
47	Tendances de la mode	{"title":"Été 2022","subtitle":"Tendances de la mode","button_text":"Lire la suite","rte_content":"<div style=\\"text-center\\">Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam.</div>"}	{"gutters":"No Gutters"}	Screen	\N	Spree::Cms::Sections::FeaturedArticle	4	Spree::Taxon	20	35	2022-07-12 18:15:57.777577	2022-07-12 18:15:57.802069
48	Fashion Trends	{"title":"Summer 2022","subtitle":"Fashion Trends","button_text":"Read More","rte_content":"<div style=\\"text-center\\">Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam.</div>"}	{"gutters":"No Gutters"}	Screen	\N	Spree::Cms::Sections::FeaturedArticle	4	Spree::Taxon	20	36	2022-07-12 18:15:57.830775	2022-07-12 18:15:57.854622
49	Carrousel tendance	\N	\N	Screen	\N	Spree::Cms::Sections::ProductCarousel	5	Spree::Taxon	20	29	2022-07-12 18:15:57.884541	2022-07-12 18:15:57.908668
50	Trending Carousel	\N	\N	Screen	\N	Spree::Cms::Sections::ProductCarousel	5	Spree::Taxon	20	30	2022-07-12 18:15:57.936657	2022-07-12 18:15:57.960737
51	Trending Carousel	\N	\N	Screen	\N	Spree::Cms::Sections::ProductCarousel	5	Spree::Taxon	20	31	2022-07-12 18:15:57.987721	2022-07-12 18:15:58.011427
52	Trending Carousel	\N	\N	Screen	\N	Spree::Cms::Sections::ProductCarousel	5	Spree::Taxon	20	25	2022-07-12 18:15:58.040509	2022-07-12 18:15:58.067203
53	Carrousel tendance	\N	\N	Screen	\N	Spree::Cms::Sections::ProductCarousel	5	Spree::Taxon	20	26	2022-07-12 18:15:58.092225	2022-07-12 18:15:58.125223
54	Trendiges Karussell	\N	\N	Screen	\N	Spree::Cms::Sections::ProductCarousel	5	Spree::Taxon	20	27	2022-07-12 18:15:58.152142	2022-07-12 18:15:58.174287
55	Carrusel de tendencias	\N	\N	Screen	\N	Spree::Cms::Sections::ProductCarousel	5	Spree::Taxon	20	28	2022-07-12 18:15:58.201086	2022-07-12 18:15:58.224035
56	Carrousel tendance	\N	\N	Screen	\N	Spree::Cms::Sections::ProductCarousel	5	Spree::Taxon	20	32	2022-07-12 18:15:58.253036	2022-07-12 18:15:58.276289
57	Trendiges Karussell	\N	\N	Screen	\N	Spree::Cms::Sections::ProductCarousel	5	Spree::Taxon	20	33	2022-07-12 18:15:58.303222	2022-07-12 18:15:58.325422
58	Carrusel de tendencias	\N	\N	Screen	\N	Spree::Cms::Sections::ProductCarousel	5	Spree::Taxon	20	34	2022-07-12 18:15:58.354015	2022-07-12 18:15:58.375659
59	Carrousel tendance	\N	\N	Screen	\N	Spree::Cms::Sections::ProductCarousel	5	Spree::Taxon	20	35	2022-07-12 18:15:58.402513	2022-07-12 18:15:58.423669
60	Trending Carousel	\N	\N	Screen	\N	Spree::Cms::Sections::ProductCarousel	5	Spree::Taxon	20	36	2022-07-12 18:15:58.451172	2022-07-12 18:15:58.474318
61	Promotions	{"link_type_one":"Spree::Taxon","link_type_two":"Spree::Taxon","title_one":"Nouvelle collection","subtitle_one":"Style de rue","link_one":"categories/streetstyle","title_two":"Summer Sale","subtitle_two":"Jusqu'à 30% de réduction","link_two":"categories/special-offers/30-percent-off"}	{"gutters":"Gutters"}	Container	\N	Spree::Cms::Sections::SideBySideImages	6	\N	\N	29	2022-07-12 18:15:58.510328	2022-07-12 18:15:58.533807
62	Promotions	{"link_type_one":"Spree::Taxon","link_type_two":"Spree::Taxon","title_one":"New Collection","subtitle_one":"Street Style","link_one":"categories/streetstyle","title_two":"Summer Sale","subtitle_two":"Up To 30% OFF","link_two":"categories/special-offers/30-percent-off"}	{"gutters":"Gutters"}	Container	\N	Spree::Cms::Sections::SideBySideImages	6	\N	\N	30	2022-07-12 18:15:58.55789	2022-07-12 18:15:58.579742
63	Promotions	{"link_type_one":"Spree::Taxon","link_type_two":"Spree::Taxon","title_one":"New Collection","subtitle_one":"Street Style","link_one":"categories/streetstyle","title_two":"Summer Sale","subtitle_two":"Up To 30% OFF","link_two":"categories/special-offers/30-percent-off"}	{"gutters":"Gutters"}	Container	\N	Spree::Cms::Sections::SideBySideImages	6	\N	\N	31	2022-07-12 18:15:58.606038	2022-07-12 18:15:58.628483
64	Promotions	{"link_type_one":"Spree::Taxon","link_type_two":"Spree::Taxon","title_one":"New Collection","subtitle_one":"Street Style","link_one":"categories/streetstyle","title_two":"Summer Sale","subtitle_two":"Up To 30% OFF","link_two":"categories/special-offers/30-percent-off"}	{"gutters":"Gutters"}	Container	\N	Spree::Cms::Sections::SideBySideImages	6	\N	\N	25	2022-07-12 18:15:58.654181	2022-07-12 18:15:58.676937
65	Promotions	{"link_type_one":"Spree::Taxon","link_type_two":"Spree::Taxon","title_one":"Nouvelle collection","subtitle_one":"Style de rue","link_one":"categories/streetstyle","title_two":"Summer Sale","subtitle_two":"Jusqu'à 30% de réduction","link_two":"categories/special-offers/30-percent-off"}	{"gutters":"Gutters"}	Container	\N	Spree::Cms::Sections::SideBySideImages	6	\N	\N	26	2022-07-12 18:15:58.703366	2022-07-12 18:15:58.725942
66	Werbeaktionen	{"link_type_one":"Spree::Taxon","link_type_two":"Spree::Taxon","title_one":"Neue Kollektion","subtitle_one":"Street Style","link_one":"categories/streetstyle","title_two":"Summer Sale","subtitle_two":"Bis zu 30% RABATT","link_two":"categories/special-offers/30-percent-off"}	{"gutters":"Gutters"}	Container	\N	Spree::Cms::Sections::SideBySideImages	6	\N	\N	27	2022-07-12 18:15:58.750974	2022-07-12 18:15:58.773992
67	Promociones	{"link_type_one":"Spree::Taxon","link_type_two":"Spree::Taxon","title_one":"Nueva colección","subtitle_one":"Estilo callejero","link_one":"categories/streetstyle","title_two":"Summer Sale","subtitle_two":"Hasta 30% DE DESCUENTO","link_two":"categories/special-offers/30-percent-off"}	{"gutters":"Gutters"}	Container	\N	Spree::Cms::Sections::SideBySideImages	6	\N	\N	28	2022-07-12 18:15:58.798498	2022-07-12 18:15:58.821634
68	Promotions	{"link_type_one":"Spree::Taxon","link_type_two":"Spree::Taxon","title_one":"Nouvelle collection","subtitle_one":"Style de rue","link_one":"categories/streetstyle","title_two":"Summer Sale","subtitle_two":"Jusqu'à 30% de réduction","link_two":"categories/special-offers/30-percent-off"}	{"gutters":"Gutters"}	Container	\N	Spree::Cms::Sections::SideBySideImages	6	\N	\N	32	2022-07-12 18:15:58.845354	2022-07-12 18:15:58.866652
69	Werbeaktionen	{"link_type_one":"Spree::Taxon","link_type_two":"Spree::Taxon","title_one":"Neue Kollektion","subtitle_one":"Street Style","link_one":"categories/streetstyle","title_two":"Summer Sale","subtitle_two":"Bis zu 30% RABATT","link_two":"categories/special-offers/30-percent-off"}	{"gutters":"Gutters"}	Container	\N	Spree::Cms::Sections::SideBySideImages	6	\N	\N	33	2022-07-12 18:15:58.890674	2022-07-12 18:15:58.914659
70	Promociones	{"link_type_one":"Spree::Taxon","link_type_two":"Spree::Taxon","title_one":"Nueva colección","subtitle_one":"Estilo callejero","link_one":"categories/streetstyle","title_two":"Summer Sale","subtitle_two":"Hasta 30% DE DESCUENTO","link_two":"categories/special-offers/30-percent-off"}	{"gutters":"Gutters"}	Container	\N	Spree::Cms::Sections::SideBySideImages	6	\N	\N	34	2022-07-12 18:15:58.941526	2022-07-12 18:15:58.965991
71	Promotions	{"link_type_one":"Spree::Taxon","link_type_two":"Spree::Taxon","title_one":"Nouvelle collection","subtitle_one":"Style de rue","link_one":"categories/streetstyle","title_two":"Summer Sale","subtitle_two":"Jusqu'à 30% de réduction","link_two":"categories/special-offers/30-percent-off"}	{"gutters":"Gutters"}	Container	\N	Spree::Cms::Sections::SideBySideImages	6	\N	\N	35	2022-07-12 18:15:58.991542	2022-07-12 18:15:59.015934
72	Promotions	{"link_type_one":"Spree::Taxon","link_type_two":"Spree::Taxon","title_one":"New Collection","subtitle_one":"Street Style","link_one":"categories/streetstyle","title_two":"Summer Sale","subtitle_two":"Up To 30% OFF","link_two":"categories/special-offers/30-percent-off"}	{"gutters":"Gutters"}	Container	\N	Spree::Cms::Sections::SideBySideImages	6	\N	\N	36	2022-07-12 18:15:59.041036	2022-07-12 18:15:59.065511
\.


--
-- Data for Name: spree_countries; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.spree_countries (id, iso_name, iso, iso3, name, numcode, states_required, updated_at, zipcode_required, created_at) FROM stdin;
1	ANDORRA	AD	AND	Andorra	20	f	\N	t	\N
3	AFGHANISTAN	AF	AFG	Afghanistan	4	f	\N	t	\N
5	ANGUILLA	AI	AIA	Anguilla	660	f	\N	t	\N
6	ALBANIA	AL	ALB	Albania	8	f	\N	t	\N
7	ARMENIA	AM	ARM	Armenia	51	f	\N	t	\N
9	ARGENTINA	AR	ARG	Argentina	32	f	\N	t	\N
10	AMERICAN SAMOA	AS	ASM	American Samoa	16	f	\N	t	\N
11	AUSTRIA	AT	AUT	Austria	40	f	\N	t	\N
14	AZERBAIJAN	AZ	AZE	Azerbaijan	31	f	\N	t	\N
15	BOSNIA AND HERZEGOVINA	BA	BIH	Bosnia and Herzegovina	70	f	\N	t	\N
16	BARBADOS	BB	BRB	Barbados	52	f	\N	t	\N
17	BANGLADESH	BD	BGD	Bangladesh	50	f	\N	t	\N
18	BELGIUM	BE	BEL	Belgium	56	f	\N	t	\N
20	BULGARIA	BG	BGR	Bulgaria	100	f	\N	t	\N
21	BAHRAIN	BH	BHR	Bahrain	48	f	\N	t	\N
24	SAINT BARTHÉLEMY	BL	BLM	Saint Barthélemy	652	f	\N	t	\N
26	BRUNEI DARUSSALAM	BN	BRN	Brunei Darussalam	96	f	\N	t	\N
28	BONAIRE, SINT EUSTATIUS AND SABA	BQ	BES	Bonaire, Sint Eustatius and Saba	535	f	\N	t	\N
31	BHUTAN	BT	BTN	Bhutan	64	f	\N	t	\N
33	BELARUS	BY	BLR	Belarus	112	f	\N	t	\N
36	COCOS (KEELING) ISLANDS	CC	CCK	Cocos (Keeling) Islands	166	f	\N	t	\N
40	SWITZERLAND	CH	CHE	Switzerland	756	f	\N	t	\N
43	CHILE	CL	CHL	Chile	152	f	\N	t	\N
46	COLOMBIA	CO	COL	Colombia	170	f	\N	t	\N
47	COSTA RICA	CR	CRI	Costa Rica	188	f	\N	t	\N
48	CUBA	CU	CUB	Cuba	192	f	\N	t	\N
49	CABO VERDE	CV	CPV	Cabo Verde	132	f	\N	t	\N
50	CURAÇAO	CW	CUW	Curaçao	531	f	\N	t	\N
51	CHRISTMAS ISLAND	CX	CXR	Christmas Island	162	f	\N	t	\N
52	CYPRUS	CY	CYP	Cyprus	196	f	\N	t	\N
53	CZECHIA	CZ	CZE	Czechia	203	f	\N	t	\N
54	GERMANY	DE	DEU	Germany	276	f	\N	t	\N
56	DENMARK	DK	DNK	Denmark	208	f	\N	t	\N
58	DOMINICAN REPUBLIC	DO	DOM	Dominican Republic	214	f	\N	t	\N
59	ALGERIA	DZ	DZA	Algeria	12	f	\N	t	\N
60	ECUADOR	EC	ECU	Ecuador	218	f	\N	t	\N
61	ESTONIA	EE	EST	Estonia	233	f	\N	t	\N
62	EGYPT	EG	EGY	Egypt	818	f	\N	t	\N
65	ETHIOPIA	ET	ETH	Ethiopia	231	f	\N	t	\N
66	FINLAND	FI	FIN	Finland	246	f	\N	t	\N
68	FALKLAND ISLANDS (MALVINAS)	FK	FLK	Falkland Islands (Malvinas)	238	f	\N	t	\N
69	MICRONESIA, FEDERATED STATES OF	FM	FSM	Micronesia, Federated States of	583	f	\N	t	\N
70	FAROE ISLANDS	FO	FRO	Faroe Islands	234	f	\N	t	\N
71	FRANCE	FR	FRA	France	250	f	\N	t	\N
72	GABON	GA	GAB	Gabon	266	f	\N	t	\N
73	UNITED KINGDOM	GB	GBR	United Kingdom	826	f	\N	t	\N
75	GEORGIA	GE	GEO	Georgia	268	f	\N	t	\N
76	FRENCH GUIANA	GF	GUF	French Guiana	254	f	\N	t	\N
77	GUERNSEY	GG	GGY	Guernsey	831	f	\N	t	\N
79	GIBRALTAR	GI	GIB	Gibraltar	292	f	\N	t	\N
80	GREENLAND	GL	GRL	Greenland	304	f	\N	t	\N
83	GUADELOUPE	GP	GLP	Guadeloupe	312	f	\N	t	\N
85	GREECE	GR	GRC	Greece	300	f	\N	t	\N
86	GUATEMALA	GT	GTM	Guatemala	320	f	\N	t	\N
87	GUAM	GU	GUM	Guam	316	f	\N	t	\N
88	GUINEA-BISSAU	GW	GNB	Guinea-Bissau	624	f	\N	t	\N
91	HONDURAS	HN	HND	Honduras	340	f	\N	t	\N
92	CROATIA	HR	HRV	Croatia	191	f	\N	t	\N
93	HAITI	HT	HTI	Haiti	332	f	\N	t	\N
94	HUNGARY	HU	HUN	Hungary	348	f	\N	t	\N
95	INDONESIA	ID	IDN	Indonesia	360	f	\N	t	\N
97	ISRAEL	IL	ISR	Israel	376	f	\N	t	\N
98	ISLE OF MAN	IM	IMN	Isle of Man	833	f	\N	t	\N
100	IRAQ	IQ	IRQ	Iraq	368	f	\N	t	\N
101	IRAN, ISLAMIC REPUBLIC OF	IR	IRN	Iran, Islamic Republic of	364	f	\N	t	\N
102	ICELAND	IS	ISL	Iceland	352	f	\N	t	\N
104	JERSEY	JE	JEY	Jersey	832	f	\N	t	\N
105	JAMAICA	JM	JAM	Jamaica	388	f	\N	t	\N
106	JORDAN	JO	JOR	Jordan	400	f	\N	t	\N
107	JAPAN	JP	JPN	Japan	392	f	\N	t	\N
108	KENYA	KE	KEN	Kenya	404	f	\N	t	\N
109	KYRGYZSTAN	KG	KGZ	Kyrgyzstan	417	f	\N	t	\N
110	CAMBODIA	KH	KHM	Cambodia	116	f	\N	t	\N
115	KOREA, REPUBLIC OF	KR	KOR	Korea, Republic of	410	f	\N	t	\N
116	KUWAIT	KW	KWT	Kuwait	414	f	\N	t	\N
117	CAYMAN ISLANDS	KY	CYM	Cayman Islands	136	f	\N	t	\N
118	KAZAKHSTAN	KZ	KAZ	Kazakhstan	398	f	\N	t	\N
119	LAO PEOPLE'S DEMOCRATIC REPUBLIC	LA	LAO	Lao People's Democratic Republic	418	f	\N	t	\N
120	LEBANON	LB	LBN	Lebanon	422	f	\N	t	\N
122	LIECHTENSTEIN	LI	LIE	Liechtenstein	438	f	\N	t	\N
123	SRI LANKA	LK	LKA	Sri Lanka	144	f	\N	t	\N
124	LIBERIA	LR	LBR	Liberia	430	f	\N	t	\N
125	LESOTHO	LS	LSO	Lesotho	426	f	\N	t	\N
126	LITHUANIA	LT	LTU	Lithuania	440	f	\N	t	\N
127	LUXEMBOURG	LU	LUX	Luxembourg	442	f	\N	t	\N
128	LATVIA	LV	LVA	Latvia	428	f	\N	t	\N
130	MOROCCO	MA	MAR	Morocco	504	f	\N	t	\N
131	MONACO	MC	MCO	Monaco	492	f	\N	t	\N
132	MOLDOVA, REPUBLIC OF	MD	MDA	Moldova, Republic of	498	f	\N	t	\N
133	MONTENEGRO	ME	MNE	Montenegro	499	f	\N	t	\N
134	SAINT MARTIN (FRENCH PART)	MF	MAF	Saint Martin (French part)	663	f	\N	t	\N
135	MADAGASCAR	MG	MDG	Madagascar	450	f	\N	t	\N
136	MARSHALL ISLANDS	MH	MHL	Marshall Islands	584	f	\N	t	\N
137	NORTH MACEDONIA	MK	MKD	North Macedonia	807	f	\N	t	\N
139	MYANMAR	MM	MMR	Myanmar	104	f	\N	t	\N
140	MONGOLIA	MN	MNG	Mongolia	496	f	\N	t	\N
142	NORTHERN MARIANA ISLANDS	MP	MNP	Northern Mariana Islands	580	f	\N	t	\N
143	MARTINIQUE	MQ	MTQ	Martinique	474	f	\N	t	\N
145	MONTSERRAT	MS	MSR	Montserrat	500	f	\N	t	\N
146	MALTA	MT	MLT	Malta	470	f	\N	t	\N
147	MAURITIUS	MU	MUS	Mauritius	480	f	\N	t	\N
148	MALDIVES	MV	MDV	Maldives	462	f	\N	t	\N
152	MOZAMBIQUE	MZ	MOZ	Mozambique	508	f	\N	t	\N
153	NAMIBIA	NA	NAM	Namibia	516	f	\N	t	\N
154	NEW CALEDONIA	NC	NCL	New Caledonia	540	f	\N	t	\N
155	NIGER	NE	NER	Niger	562	f	\N	t	\N
156	NORFOLK ISLAND	NF	NFK	Norfolk Island	574	f	\N	t	\N
157	NIGERIA	NG	NGA	Nigeria	566	f	\N	t	\N
158	NICARAGUA	NI	NIC	Nicaragua	558	f	\N	t	\N
159	NETHERLANDS	NL	NLD	Netherlands	528	f	\N	t	\N
160	NORWAY	NO	NOR	Norway	578	f	\N	t	\N
161	NEPAL	NP	NPL	Nepal	524	f	\N	t	\N
165	OMAN	OM	OMN	Oman	512	f	\N	t	\N
167	PERU	PE	PER	Peru	604	f	\N	t	\N
168	FRENCH POLYNESIA	PF	PYF	French Polynesia	258	f	\N	t	\N
169	PAPUA NEW GUINEA	PG	PNG	Papua New Guinea	598	f	\N	t	\N
170	PHILIPPINES	PH	PHL	Philippines	608	f	\N	t	\N
171	PAKISTAN	PK	PAK	Pakistan	586	f	\N	t	\N
172	POLAND	PL	POL	Poland	616	f	\N	t	\N
173	SAINT PIERRE AND MIQUELON	PM	SPM	Saint Pierre and Miquelon	666	f	\N	t	\N
174	PITCAIRN	PN	PCN	Pitcairn	612	f	\N	t	\N
175	PUERTO RICO	PR	PRI	Puerto Rico	630	f	\N	t	\N
176	PALESTINE, STATE OF	PS	PSE	Palestine, State of	275	f	\N	t	\N
178	PALAU	PW	PLW	Palau	585	f	\N	t	\N
179	PARAGUAY	PY	PRY	Paraguay	600	f	\N	t	\N
181	RÉUNION	RE	REU	Réunion	638	f	\N	t	\N
183	SERBIA	RS	SRB	Serbia	688	f	\N	t	\N
184	RUSSIA	RU	RUS	Russia	643	f	\N	t	\N
186	SAUDI ARABIA	SA	SAU	Saudi Arabia	682	f	\N	t	\N
189	SUDAN	SD	SDN	Sudan	729	f	\N	t	\N
190	SWEDEN	SE	SWE	Sweden	752	f	\N	t	\N
191	SINGAPORE	SG	SGP	Singapore	702	f	\N	t	\N
111	KIRIBATI	KI	KIR	Kiribati	296	f	\N	f	\N
192	SAINT HELENA, ASCENSION AND TRISTAN DA CUNHA	SH	SHN	Saint Helena, Ascension and Tristan da Cunha	654	f	\N	t	\N
193	SLOVENIA	SI	SVN	Slovenia	705	f	\N	t	\N
194	SVALBARD AND JAN MAYEN	SJ	SJM	Svalbard and Jan Mayen	744	f	\N	t	\N
195	SLOVAKIA	SK	SVK	Slovakia	703	f	\N	t	\N
197	SAN MARINO	SM	SMR	San Marino	674	f	\N	t	\N
198	SENEGAL	SN	SEN	Senegal	686	f	\N	t	\N
201	SOUTH SUDAN	SS	SSD	South Sudan	728	f	\N	t	\N
203	EL SALVADOR	SV	SLV	El Salvador	222	f	\N	t	\N
204	SINT MAARTEN (DUTCH PART)	SX	SXM	Sint Maarten (Dutch part)	534	f	\N	t	\N
206	ESWATINI	SZ	SWZ	Eswatini	748	f	\N	t	\N
207	TURKS AND CAICOS ISLANDS	TC	TCA	Turks and Caicos Islands	796	f	\N	t	\N
208	CHAD	TD	TCD	Chad	148	f	\N	t	\N
211	TAJIKISTAN	TJ	TJK	Tajikistan	762	f	\N	t	\N
214	TURKMENISTAN	TM	TKM	Turkmenistan	795	f	\N	t	\N
215	TUNISIA	TN	TUN	Tunisia	788	f	\N	t	\N
217	TURKEY	TR	TUR	Turkey	792	f	\N	t	\N
218	TRINIDAD AND TOBAGO	TT	TTO	Trinidad and Tobago	780	f	\N	t	\N
220	TAIWAN	TW	TWN	Taiwan	158	f	\N	t	\N
222	UKRAINE	UA	UKR	Ukraine	804	f	\N	t	\N
225	URUGUAY	UY	URY	Uruguay	858	f	\N	t	\N
226	UZBEKISTAN	UZ	UZB	Uzbekistan	860	f	\N	t	\N
227	HOLY SEE (VATICAN CITY STATE)	VA	VAT	Holy See (Vatican City State)	336	f	\N	t	\N
228	SAINT VINCENT AND THE GRENADINES	VC	VCT	Saint Vincent and the Grenadines	670	f	\N	t	\N
229	VENEZUELA, BOLIVARIAN REPUBLIC OF	VE	VEN	Venezuela, Bolivarian Republic of	862	f	\N	t	\N
230	VIRGIN ISLANDS, BRITISH	VG	VGB	Virgin Islands, British	92	f	\N	t	\N
231	VIRGIN ISLANDS, U.S.	VI	VIR	Virgin Islands, U.S.	850	f	\N	t	\N
232	VIETNAM	VN	VNM	Vietnam	704	f	\N	t	\N
234	WALLIS AND FUTUNA	WF	WLF	Wallis and Futuna	876	f	\N	t	\N
235	SAMOA	WS	WSM	Samoa	882	f	\N	t	\N
237	MAYOTTE	YT	MYT	Mayotte	175	f	\N	t	\N
239	ZAMBIA	ZM	ZMB	Zambia	894	f	\N	t	\N
4	ANTIGUA AND BARBUDA	AG	ATG	Antigua and Barbuda	28	f	\N	f	\N
8	ANGOLA	AO	AGO	Angola	24	f	\N	f	\N
13	ARUBA	AW	ABW	Aruba	533	f	\N	f	\N
19	BURKINA FASO	BF	BFA	Burkina Faso	854	f	\N	f	\N
22	BURUNDI	BI	BDI	Burundi	108	f	\N	f	\N
23	BENIN	BJ	BEN	Benin	204	f	\N	f	\N
25	BERMUDA	BM	BMU	Bermuda	60	f	\N	f	\N
27	BOLIVIA, PLURINATIONAL STATE OF	BO	BOL	Bolivia, Plurinational State of	68	f	\N	f	\N
30	BAHAMAS	BS	BHS	Bahamas	44	f	\N	f	\N
32	BOTSWANA	BW	BWA	Botswana	72	f	\N	f	\N
34	BELIZE	BZ	BLZ	Belize	84	f	\N	f	\N
37	CONGO, THE DEMOCRATIC REPUBLIC OF THE	CD	COD	Congo, The Democratic Republic of the	180	f	\N	f	\N
38	CENTRAL AFRICAN REPUBLIC	CF	CAF	Central African Republic	140	f	\N	f	\N
39	CONGO	CG	COG	Congo	178	f	\N	f	\N
41	CÔTE D'IVOIRE	CI	CIV	Côte d'Ivoire	384	f	\N	f	\N
42	COOK ISLANDS	CK	COK	Cook Islands	184	f	\N	f	\N
44	CAMEROON	CM	CMR	Cameroon	120	f	\N	f	\N
55	DJIBOUTI	DJ	DJI	Djibouti	262	f	\N	f	\N
57	DOMINICA	DM	DMA	Dominica	212	f	\N	f	\N
63	ERITREA	ER	ERI	Eritrea	232	f	\N	f	\N
67	FIJI	FJ	FJI	Fiji	242	f	\N	f	\N
74	GRENADA	GD	GRD	Grenada	308	f	\N	f	\N
78	GHANA	GH	GHA	Ghana	288	f	\N	f	\N
81	GAMBIA	GM	GMB	Gambia	270	f	\N	f	\N
82	GUINEA	GN	GIN	Guinea	324	f	\N	f	\N
84	EQUATORIAL GUINEA	GQ	GNQ	Equatorial Guinea	226	f	\N	f	\N
89	GUYANA	GY	GUY	Guyana	328	f	\N	f	\N
112	COMOROS	KM	COM	Comoros	174	f	\N	f	\N
113	SAINT KITTS AND NEVIS	KN	KNA	Saint Kitts and Nevis	659	f	\N	f	\N
114	KOREA, DEMOCRATIC PEOPLE'S REPUBLIC OF	KP	PRK	Korea, Democratic People's Republic of	408	f	\N	f	\N
121	SAINT LUCIA	LC	LCA	Saint Lucia	662	f	\N	f	\N
129	LIBYA	LY	LBY	Libya	434	f	\N	f	\N
138	MALI	ML	MLI	Mali	466	f	\N	f	\N
141	MACAO	MO	MAC	Macao	446	f	\N	f	\N
144	MAURITANIA	MR	MRT	Mauritania	478	f	\N	f	\N
149	MALAWI	MW	MWI	Malawi	454	f	\N	f	\N
162	NAURU	NR	NRU	Nauru	520	f	\N	f	\N
163	NIUE	NU	NIU	Niue	570	f	\N	f	\N
166	PANAMA	PA	PAN	Panama	591	f	\N	f	\N
180	QATAR	QA	QAT	Qatar	634	f	\N	f	\N
185	RWANDA	RW	RWA	Rwanda	646	f	\N	f	\N
187	SOLOMON ISLANDS	SB	SLB	Solomon Islands	90	f	\N	f	\N
188	SEYCHELLES	SC	SYC	Seychelles	690	f	\N	f	\N
196	SIERRA LEONE	SL	SLE	Sierra Leone	694	f	\N	f	\N
199	SOMALIA	SO	SOM	Somalia	706	f	\N	f	\N
200	SURINAME	SR	SUR	Suriname	740	f	\N	f	\N
202	SAO TOME AND PRINCIPE	ST	STP	Sao Tome and Principe	678	f	\N	f	\N
205	SYRIAN ARAB REPUBLIC	SY	SYR	Syrian Arab Republic	760	f	\N	f	\N
209	TOGO	TG	TGO	Togo	768	f	\N	f	\N
212	TOKELAU	TK	TKL	Tokelau	772	f	\N	f	\N
213	TIMOR-LESTE	TL	TLS	Timor-Leste	626	f	\N	f	\N
216	TONGA	TO	TON	Tonga	776	f	\N	f	\N
219	TUVALU	TV	TUV	Tuvalu	798	f	\N	f	\N
221	TANZANIA, UNITED REPUBLIC OF	TZ	TZA	Tanzania, United Republic of	834	f	\N	f	\N
223	UGANDA	UG	UGA	Uganda	800	f	\N	f	\N
233	VANUATU	VU	VUT	Vanuatu	548	f	\N	f	\N
236	YEMEN	YE	YEM	Yemen	887	f	\N	f	\N
240	ZIMBABWE	ZW	ZWE	Zimbabwe	716	f	\N	f	\N
12	AUSTRALIA	AU	AUS	Australia	36	t	\N	t	\N
29	BRAZIL	BR	BRA	Brazil	76	t	\N	t	\N
35	CANADA	CA	CAN	Canada	124	t	\N	t	\N
45	CHINA	CN	CHN	China	156	t	\N	t	\N
64	SPAIN	ES	ESP	Spain	724	t	\N	t	\N
99	INDIA	IN	IND	India	356	t	\N	t	\N
103	ITALY	IT	ITA	Italy	380	t	\N	t	\N
150	MEXICO	MX	MEX	Mexico	484	t	\N	t	\N
151	MALAYSIA	MY	MYS	Malaysia	458	t	\N	t	\N
164	NEW ZEALAND	NZ	NZL	New Zealand	554	t	\N	t	\N
177	PORTUGAL	PT	PRT	Portugal	620	t	\N	t	\N
182	ROMANIA	RO	ROU	Romania	642	t	\N	t	\N
210	THAILAND	TH	THA	Thailand	764	t	\N	t	\N
224	UNITED STATES	US	USA	United States	840	t	\N	t	\N
238	SOUTH AFRICA	ZA	ZAF	South Africa	710	t	\N	t	\N
2	UNITED ARAB EMIRATES	AE	ARE	United Arab Emirates	784	t	\N	f	\N
90	HONG KONG	HK	HKG	Hong Kong	344	t	\N	f	\N
96	IRELAND	IE	IRL	Ireland	372	t	\N	f	\N
\.


--
-- Data for Name: spree_credit_cards; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.spree_credit_cards (id, month, year, cc_type, last_digits, address_id, gateway_customer_profile_id, gateway_payment_profile_id, created_at, updated_at, name, user_id, payment_method_id, "default", deleted_at, public_metadata, private_metadata) FROM stdin;
1	12	2024	visa	1111	\N	BGS-1234	\N	2022-07-12 18:15:53.472361	2022-07-12 18:15:53.472361	Sean Schofield	\N	\N	f	\N	\N	\N
\.


--
-- Data for Name: spree_customer_returns; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.spree_customer_returns (id, number, stock_location_id, created_at, updated_at, store_id, public_metadata, private_metadata) FROM stdin;
\.


--
-- Data for Name: spree_digital_links; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.spree_digital_links (id, digital_id, line_item_id, token, access_counter, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: spree_digitals; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.spree_digitals (id, variant_id, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: spree_gateways; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.spree_gateways (id, type, name, description, active, environment, server, test_mode, created_at, updated_at, preferences) FROM stdin;
\.


--
-- Data for Name: spree_inventory_units; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.spree_inventory_units (id, state, variant_id, order_id, shipment_id, created_at, updated_at, pending, line_item_id, quantity, original_return_item_id) FROM stdin;
1	on_hand	1	1	1	2022-07-12 18:15:53.041315	2022-07-12 18:15:53.041315	t	1	1	\N
2	on_hand	2	2	2	2022-07-12 18:15:53.231479	2022-07-12 18:15:53.231479	t	2	1	\N
\.


--
-- Data for Name: spree_line_items; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.spree_line_items (id, variant_id, order_id, quantity, price, created_at, updated_at, currency, cost_price, tax_category_id, adjustment_total, additional_tax_total, promo_total, included_tax_total, pre_tax_amount, taxable_adjustment_total, non_taxable_adjustment_total, public_metadata, private_metadata) FROM stdin;
1	1	1	1	24.99	2022-07-12 18:15:52.695273	2022-07-12 18:15:52.763734	USD	\N	1	0.00	0.00	0.00	0.00	24.9900	0.00	0.00	\N	\N
2	2	2	1	24.99	2022-07-12 18:15:52.80378	2022-07-12 18:15:52.855931	USD	\N	1	0.00	0.00	0.00	0.00	24.9900	0.00	0.00	\N	\N
\.


--
-- Data for Name: spree_log_entries; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.spree_log_entries (id, source_type, source_id, details, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: spree_menu_items; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.spree_menu_items (id, name, subtitle, destination, new_window, item_type, linked_resource_type, linked_resource_id, code, parent_id, lft, rgt, depth, menu_id, created_at, updated_at) FROM stdin;
178	Faldas y blusas	\N	\N	f	Link	Spree::Taxon	11	\N	173	341	342	2	8	2022-07-12 18:16:18.253333	2022-07-12 18:16:18.324457
181	Chaquetas y abrigos	\N	\N	f	Link	Spree::Taxon	14	\N	173	347	348	2	8	2022-07-12 18:16:18.617836	2022-07-12 18:16:18.687751
176	Faldas	\N	\N	f	Link	Spree::Taxon	9	\N	173	337	338	2	8	2022-07-12 18:16:18.029379	2022-07-12 18:16:18.103467
177	Vestidos	\N	\N	f	Link	Spree::Taxon	10	\N	173	339	340	2	8	2022-07-12 18:16:18.139141	2022-07-12 18:16:18.21771
173	Hombres	\N	\N	f	Link	Spree::Taxon	3	\N	8	336	349	1	8	2022-07-12 18:16:17.683957	2022-07-12 18:16:18.697248
179	Suéteres	\N	\N	f	Link	Spree::Taxon	12	\N	173	343	344	2	8	2022-07-12 18:16:18.359706	2022-07-12 18:16:18.474985
180	Tops y camisetas	\N	\N	f	Link	Spree::Taxon	13	\N	173	345	346	2	8	2022-07-12 18:16:18.510987	2022-07-12 18:16:18.581515
184	Suéteres	\N	\N	f	Link	Spree::Taxon	7	\N	174	355	356	2	8	2022-07-12 18:16:18.949087	2022-07-12 18:16:19.032075
182	Camisas	\N	\N	f	Link	Spree::Taxon	5	\N	174	351	352	2	8	2022-07-12 18:16:18.72249	2022-07-12 18:16:18.798276
183	Camisetas	\N	\N	f	Link	Spree::Taxon	6	\N	174	353	354	2	8	2022-07-12 18:16:18.83438	2022-07-12 18:16:18.908502
187	Sudaderas	\N	\N	f	Link	Spree::Taxon	16	\N	175	363	364	2	8	2022-07-12 18:16:19.299722	2022-07-12 18:16:19.375513
185	Chaquetas y abrigos	\N	\N	f	Link	Spree::Taxon	8	\N	174	357	358	2	8	2022-07-12 18:16:19.06704	2022-07-12 18:16:19.151727
174	Mujeres	\N	\N	f	Link	Spree::Taxon	2	\N	8	350	359	1	8	2022-07-12 18:16:17.797328	2022-07-12 18:16:19.161327
186	Tops	\N	\N	f	Link	Spree::Taxon	15	\N	175	361	362	2	8	2022-07-12 18:16:19.188723	2022-07-12 18:16:19.263099
188	Pantalones	\N	\N	f	Link	Spree::Taxon	17	\N	175	365	366	2	8	2022-07-12 18:16:19.411302	2022-07-12 18:16:19.485267
175	Ropa de deporte	\N	\N	f	Link	Spree::Taxon	4	\N	8	360	367	1	8	2022-07-12 18:16:17.91015	2022-07-12 18:16:19.494948
13	Women	\N	\N	f	Link	Spree::Taxon	3	\N	1	2	23	1	1	2022-07-12 18:15:59.925184	2022-07-12 18:16:02.13462
198	Nouvelle collection	Été 2022	\N	f	Link	Spree::Taxon	24	\N	195	386	387	3	9	2022-07-12 18:16:20.52199	2022-07-12 18:16:21.77083
199	Offres spéciales	Obtenez jusqu'à 30% de réduction	\N	f	Link	Spree::Taxon	26	\N	195	388	389	3	9	2022-07-12 18:16:20.646449	2022-07-12 18:16:21.77083
195	Promos	\N	\N	f	Container	URL	\N	promo	189	385	390	2	9	2022-07-12 18:16:20.182725	2022-07-12 18:16:21.77083
200	Nouvelle collection	Été 2022	\N	f	Link	Spree::Taxon	24	\N	196	404	405	3	9	2022-07-12 18:16:20.757251	2022-07-12 18:16:22.224639
196	Promos	\N	\N	f	Container	URL	\N	promo	190	403	408	2	9	2022-07-12 18:16:20.27005	2022-07-12 18:16:22.224639
193	Catégories	\N	\N	f	Container	URL	\N	category	190	393	402	2	9	2022-07-12 18:16:20.016185	2022-07-12 18:16:22.291893
204	Jupes	\N	\N	f	Link	Spree::Taxon	9	\N	192	372	373	3	9	2022-07-12 18:16:21.186861	2022-07-12 18:16:21.256082
205	Robes	\N	\N	f	Link	Spree::Taxon	10	\N	192	374	375	3	9	2022-07-12 18:16:21.293218	2022-07-12 18:16:21.372249
208	Hauts et T-shirts	\N	\N	f	Link	Spree::Taxon	13	\N	192	380	381	3	9	2022-07-12 18:16:21.629632	2022-07-12 18:16:21.703473
206	Jupes et chemisiers	\N	\N	f	Link	Spree::Taxon	11	\N	192	376	377	3	9	2022-07-12 18:16:21.410973	2022-07-12 18:16:21.487201
207	Chandails	\N	\N	f	Link	Spree::Taxon	12	\N	192	378	379	3	9	2022-07-12 18:16:21.524698	2022-07-12 18:16:21.595532
191	Tenue de sport	\N	\N	f	Link	Spree::Taxon	4	\N	9	410	425	1	9	2022-07-12 18:16:19.790662	2022-07-12 18:16:22.692378
209	Vestes et manteaux	\N	\N	f	Link	Spree::Taxon	14	\N	192	382	383	3	9	2022-07-12 18:16:21.748815	2022-07-12 18:16:21.826487
192	Catégories	\N	\N	f	Container	URL	\N	category	189	371	384	2	9	2022-07-12 18:16:19.923142	2022-07-12 18:16:21.836655
189	Femmes	\N	\N	f	Link	Spree::Taxon	3	\N	9	370	391	1	9	2022-07-12 18:16:19.525924	2022-07-12 18:16:21.836655
194	Catégories	\N	\N	f	Container	URL	\N	category	191	411	418	2	9	2022-07-12 18:16:20.0989	2022-07-12 18:16:22.692378
201	Offres spéciales	Obtenez jusqu'à 30% de réduction	\N	f	Link	Spree::Taxon	26	\N	196	406	407	3	9	2022-07-12 18:16:20.859316	2022-07-12 18:16:22.224639
190	Hommes	\N	\N	f	Link	Spree::Taxon	2	\N	9	392	409	1	9	2022-07-12 18:16:19.640314	2022-07-12 18:16:22.291893
203	Offres spéciales	Obtenez jusqu'à 30% de réduction	\N	f	Link	Spree::Taxon	26	\N	197	422	423	3	9	2022-07-12 18:16:21.079808	2022-07-12 18:16:22.60417
197	Promos	\N	\N	f	Container	URL	\N	promo	191	419	424	2	9	2022-07-12 18:16:20.406712	2022-07-12 18:16:22.60417
202	Nouvelle collection	Été 2022	\N	f	Link	Spree::Taxon	24	\N	197	420	421	3	9	2022-07-12 18:16:20.971732	2022-07-12 18:16:22.60417
19	Promos	\N	\N	f	Container	URL	\N	promo	13	17	22	2	1	2022-07-12 18:16:00.532599	2022-07-12 18:16:02.068813
17	Categories	\N	\N	f	Container	URL	\N	category	14	25	34	2	1	2022-07-12 18:16:00.361292	2022-07-12 18:16:02.586171
21	Promos	\N	\N	f	Container	URL	\N	promo	15	51	56	2	1	2022-07-12 18:16:00.705167	2022-07-12 18:16:02.857474
18	Categories	\N	\N	f	Container	URL	\N	category	15	43	50	2	1	2022-07-12 18:16:00.447117	2022-07-12 18:16:02.923833
212	Chandails	\N	\N	f	Link	Spree::Taxon	7	\N	193	398	399	3	9	2022-07-12 18:16:22.089573	2022-07-12 18:16:22.163575
210	Chemises	\N	\N	f	Link	Spree::Taxon	5	\N	193	394	395	3	9	2022-07-12 18:16:21.864325	2022-07-12 18:16:21.94185
29	Dresses	\N	\N	f	Link	Spree::Taxon	10	\N	16	6	7	3	1	2022-07-12 18:16:01.589901	2022-07-12 18:16:01.657924
211	T-Shirts	\N	\N	f	Link	Spree::Taxon	6	\N	193	396	397	3	9	2022-07-12 18:16:21.979421	2022-07-12 18:16:22.054213
214	Hauts	\N	\N	f	Link	Spree::Taxon	15	\N	194	412	413	3	9	2022-07-12 18:16:22.320972	2022-07-12 18:16:22.425981
213	Vestes et manteaux	\N	\N	f	Link	Spree::Taxon	8	\N	193	400	401	3	9	2022-07-12 18:16:22.203234	2022-07-12 18:16:22.280063
215	Pulls molletonnés	\N	\N	f	Link	Spree::Taxon	16	\N	194	414	415	3	9	2022-07-12 18:16:22.463356	2022-07-12 18:16:22.539545
216	Pantalon	\N	\N	f	Link	Spree::Taxon	17	\N	194	416	417	3	9	2022-07-12 18:16:22.583214	2022-07-12 18:16:22.657813
220	Jupes	\N	\N	f	Link	Spree::Taxon	9	\N	217	429	430	2	10	2022-07-12 18:16:23.090728	2022-07-12 18:16:23.163458
28	Skirts	\N	\N	f	Link	Spree::Taxon	9	\N	16	4	5	3	1	2022-07-12 18:16:01.484159	2022-07-12 18:16:01.554403
221	Robes	\N	\N	f	Link	Spree::Taxon	10	\N	217	431	432	2	10	2022-07-12 18:16:23.199227	2022-07-12 18:16:23.275844
222	Jupes et chemisiers	\N	\N	f	Link	Spree::Taxon	11	\N	217	433	434	2	10	2022-07-12 18:16:23.316196	2022-07-12 18:16:23.396775
31	Sweaters	\N	\N	f	Link	Spree::Taxon	12	\N	16	10	11	3	1	2022-07-12 18:16:01.79645	2022-07-12 18:16:01.867842
35	T-Shirts	\N	\N	f	Link	Spree::Taxon	6	\N	17	28	29	3	1	2022-07-12 18:16:02.268207	2022-07-12 18:16:02.339678
30	Skirts and Blouses	\N	\N	f	Link	Spree::Taxon	11	\N	16	8	9	3	1	2022-07-12 18:16:01.691851	2022-07-12 18:16:01.761453
32	Tops and T-Shirts	\N	\N	f	Link	Spree::Taxon	13	\N	16	12	13	3	1	2022-07-12 18:16:01.914618	2022-07-12 18:16:02.007106
34	Shirts	\N	\N	f	Link	Spree::Taxon	5	\N	17	26	27	3	1	2022-07-12 18:16:02.160211	2022-07-12 18:16:02.232295
223	Chandails	\N	\N	f	Link	Spree::Taxon	12	\N	217	435	436	2	10	2022-07-12 18:16:23.44502	2022-07-12 18:16:23.526019
218	Hommes	\N	\N	f	Link	Spree::Taxon	2	\N	10	442	451	1	10	2022-07-12 18:16:22.860569	2022-07-12 18:16:24.236757
219	Tenue de sport	\N	\N	f	Link	Spree::Taxon	4	\N	10	452	459	1	10	2022-07-12 18:16:22.979937	2022-07-12 18:16:24.660146
22	New Collection	Summer 2022	\N	f	Link	Spree::Taxon	24	\N	19	18	19	3	1	2022-07-12 18:16:00.797958	2022-07-12 18:16:02.068813
23	Special Offers	Get up to 30% off	\N	f	Link	Spree::Taxon	26	\N	19	20	21	3	1	2022-07-12 18:16:00.913934	2022-07-12 18:16:02.068813
33	Jackets and Coats	\N	\N	f	Link	Spree::Taxon	14	\N	16	14	15	3	1	2022-07-12 18:16:02.047314	2022-07-12 18:16:02.124898
16	Categories	\N	\N	f	Container	URL	\N	category	13	3	16	2	1	2022-07-12 18:16:00.276838	2022-07-12 18:16:02.13462
38	Tops	\N	\N	f	Link	Spree::Taxon	15	\N	18	44	45	3	1	2022-07-12 18:16:02.613424	2022-07-12 18:16:02.688582
37	Jackets and Coats	\N	\N	f	Link	Spree::Taxon	8	\N	17	32	33	3	1	2022-07-12 18:16:02.498918	2022-07-12 18:16:02.575232
14	Men	\N	\N	f	Link	Spree::Taxon	2	\N	1	24	41	1	1	2022-07-12 18:16:00.048126	2022-07-12 18:16:02.586171
36	Sweaters	\N	\N	f	Link	Spree::Taxon	7	\N	17	30	31	3	1	2022-07-12 18:16:02.376106	2022-07-12 18:16:02.451163
24	New Collection	Summer 2022	\N	f	Link	Spree::Taxon	24	\N	20	36	37	3	1	2022-07-12 18:16:01.018374	2022-07-12 18:16:02.519255
25	Special Offers	Get up to 30% off	\N	f	Link	Spree::Taxon	26	\N	20	38	39	3	1	2022-07-12 18:16:01.132199	2022-07-12 18:16:02.519255
20	Promos	\N	\N	f	Container	URL	\N	promo	14	35	40	2	1	2022-07-12 18:16:00.618361	2022-07-12 18:16:02.519255
40	Pants	\N	\N	f	Link	Spree::Taxon	17	\N	18	48	49	3	1	2022-07-12 18:16:02.837329	2022-07-12 18:16:02.914037
1	Main Menu	\N	\N	f	Container	URL	\N	\N	\N	1	58	0	1	2022-07-12 18:15:59.143421	2022-07-12 18:16:02.923833
15	Sportswear	\N	\N	f	Link	Spree::Taxon	4	\N	1	42	57	1	1	2022-07-12 18:16:00.160437	2022-07-12 18:16:02.923833
39	Sweatshirts	\N	\N	f	Link	Spree::Taxon	16	\N	18	46	47	3	1	2022-07-12 18:16:02.723834	2022-07-12 18:16:02.79759
27	Special Offers	Get up to 30% off	\N	f	Link	Spree::Taxon	26	\N	21	54	55	3	1	2022-07-12 18:16:01.371349	2022-07-12 18:16:02.857474
26	New Collection	Summer 2022	\N	f	Link	Spree::Taxon	24	\N	21	52	53	3	1	2022-07-12 18:16:01.242448	2022-07-12 18:16:02.857474
46	Skirts and Blouses	\N	\N	f	Link	Spree::Taxon	11	\N	41	65	66	2	2	2022-07-12 18:16:03.569808	2022-07-12 18:16:03.650898
45	Dresses	\N	\N	f	Link	Spree::Taxon	10	\N	41	63	64	2	2	2022-07-12 18:16:03.461418	2022-07-12 18:16:03.533974
44	Skirts	\N	\N	f	Link	Spree::Taxon	9	\N	41	61	62	2	2	2022-07-12 18:16:03.347637	2022-07-12 18:16:03.425274
47	Sweaters	\N	\N	f	Link	Spree::Taxon	12	\N	41	67	68	2	2	2022-07-12 18:16:03.689054	2022-07-12 18:16:03.763423
48	Tops and T-Shirts	\N	\N	f	Link	Spree::Taxon	13	\N	41	69	70	2	2	2022-07-12 18:16:03.81649	2022-07-12 18:16:03.922173
41	Women	\N	\N	f	Link	Spree::Taxon	3	\N	2	60	73	1	2	2022-07-12 18:16:02.95408	2022-07-12 18:16:04.093336
49	Jackets and Coats	\N	\N	f	Link	Spree::Taxon	14	\N	41	71	72	2	2	2022-07-12 18:16:04.002264	2022-07-12 18:16:04.083599
50	Shirts	\N	\N	f	Link	Spree::Taxon	5	\N	42	75	76	2	2	2022-07-12 18:16:04.119522	2022-07-12 18:16:04.189116
228	Chandails	\N	\N	f	Link	Spree::Taxon	7	\N	218	447	448	2	10	2022-07-12 18:16:24.008658	2022-07-12 18:16:24.092548
224	Hauts et T-shirts	\N	\N	f	Link	Spree::Taxon	13	\N	217	437	438	2	10	2022-07-12 18:16:23.56419	2022-07-12 18:16:23.637355
51	T-Shirts	\N	\N	f	Link	Spree::Taxon	6	\N	42	77	78	2	2	2022-07-12 18:16:04.224173	2022-07-12 18:16:04.301427
225	Vestes et manteaux	\N	\N	f	Link	Spree::Taxon	14	\N	217	439	440	2	10	2022-07-12 18:16:23.676071	2022-07-12 18:16:23.748284
217	Femmes	\N	\N	f	Link	Spree::Taxon	3	\N	10	428	441	1	10	2022-07-12 18:16:22.725831	2022-07-12 18:16:23.758141
226	Chemises	\N	\N	f	Link	Spree::Taxon	5	\N	218	443	444	2	10	2022-07-12 18:16:23.784399	2022-07-12 18:16:23.854407
52	Sweaters	\N	\N	f	Link	Spree::Taxon	7	\N	42	79	80	2	2	2022-07-12 18:16:04.338662	2022-07-12 18:16:04.411605
227	T-Shirts	\N	\N	f	Link	Spree::Taxon	6	\N	218	445	446	2	10	2022-07-12 18:16:23.891601	2022-07-12 18:16:23.96507
229	Vestes et manteaux	\N	\N	f	Link	Spree::Taxon	8	\N	218	449	450	2	10	2022-07-12 18:16:24.144136	2022-07-12 18:16:24.226892
230	Hauts	\N	\N	f	Link	Spree::Taxon	15	\N	219	453	454	2	10	2022-07-12 18:16:24.271126	2022-07-12 18:16:24.344212
53	Jackets and Coats	\N	\N	f	Link	Spree::Taxon	8	\N	42	81	82	2	2	2022-07-12 18:16:04.446423	2022-07-12 18:16:04.518213
42	Men	\N	\N	f	Link	Spree::Taxon	2	\N	2	74	83	1	2	2022-07-12 18:16:03.072454	2022-07-12 18:16:04.526998
54	Tops	\N	\N	f	Link	Spree::Taxon	15	\N	43	85	86	2	2	2022-07-12 18:16:04.552488	2022-07-12 18:16:04.621183
56	Pants	\N	\N	f	Link	Spree::Taxon	17	\N	43	89	90	2	2	2022-07-12 18:16:04.772054	2022-07-12 18:16:04.848894
231	Pulls molletonnés	\N	\N	f	Link	Spree::Taxon	16	\N	219	455	456	2	10	2022-07-12 18:16:24.40806	2022-07-12 18:16:24.483875
232	Pantalon	\N	\N	f	Link	Spree::Taxon	17	\N	219	457	458	2	10	2022-07-12 18:16:24.523788	2022-07-12 18:16:24.649127
43	Sportswear	\N	\N	f	Link	Spree::Taxon	4	\N	2	84	91	1	2	2022-07-12 18:16:03.211917	2022-07-12 18:16:04.857691
2	Footer Menu	\N	\N	f	Container	URL	\N	\N	\N	59	92	0	2	2022-07-12 18:15:59.22014	2022-07-12 18:16:04.857691
55	Sweatshirts	\N	\N	f	Link	Spree::Taxon	16	\N	43	87	88	2	2	2022-07-12 18:16:04.655247	2022-07-12 18:16:04.733997
233	Women	\N	\N	f	Link	Spree::Taxon	3	\N	11	462	483	1	11	2022-07-12 18:16:24.6929	2022-07-12 18:16:27.277341
236	Categories	\N	\N	f	Container	URL	\N	category	233	463	476	2	11	2022-07-12 18:16:25.114871	2022-07-12 18:16:27.277341
237	Categories	\N	\N	f	Container	URL	\N	category	234	485	494	2	11	2022-07-12 18:16:25.260085	2022-07-12 18:16:27.833857
242	New Collection	Summer 2022	\N	f	Link	Spree::Taxon	24	\N	239	478	479	3	11	2022-07-12 18:16:25.741152	2022-07-12 18:16:27.162605
243	Special Offers	Get up to 30% off	\N	f	Link	Spree::Taxon	26	\N	239	480	481	3	11	2022-07-12 18:16:25.845486	2022-07-12 18:16:27.162605
239	Promos	\N	\N	f	Container	URL	\N	promo	233	477	482	2	11	2022-07-12 18:16:25.495716	2022-07-12 18:16:27.162605
69	Offres spéciales	Obtenez jusqu'à 30% de réduction	\N	f	Link	Spree::Taxon	26	\N	64	130	131	3	3	2022-07-12 18:16:06.054858	2022-07-12 18:16:07.653824
64	Promos	\N	\N	f	Container	URL	\N	promo	58	127	132	2	3	2022-07-12 18:16:05.533674	2022-07-12 18:16:07.653824
248	Skirts	\N	\N	f	Link	Spree::Taxon	9	\N	236	464	465	3	11	2022-07-12 18:16:26.490512	2022-07-12 18:16:26.568946
249	Dresses	\N	\N	f	Link	Spree::Taxon	10	\N	236	466	467	3	11	2022-07-12 18:16:26.607277	2022-07-12 18:16:26.691129
244	New Collection	Summer 2022	\N	f	Link	Spree::Taxon	24	\N	240	496	497	3	11	2022-07-12 18:16:25.958286	2022-07-12 18:16:27.69065
245	Special Offers	Get up to 30% off	\N	f	Link	Spree::Taxon	26	\N	240	498	499	3	11	2022-07-12 18:16:26.065757	2022-07-12 18:16:27.69065
240	Promos	\N	\N	f	Container	URL	\N	promo	234	495	500	2	11	2022-07-12 18:16:25.582515	2022-07-12 18:16:27.69065
68	Nouvelle collection	Été 2022	\N	f	Link	Spree::Taxon	24	\N	64	128	129	3	3	2022-07-12 18:16:05.948452	2022-07-12 18:16:07.653824
234	Men	\N	\N	f	Link	Spree::Taxon	2	\N	11	484	501	1	11	2022-07-12 18:16:24.909047	2022-07-12 18:16:27.833857
241	Promos	\N	\N	f	Container	URL	\N	promo	235	511	516	2	11	2022-07-12 18:16:25.66031	2022-07-12 18:16:28.194392
238	Categories	\N	\N	f	Container	URL	\N	category	235	503	510	2	11	2022-07-12 18:16:25.378174	2022-07-12 18:16:28.260935
67	Offres spéciales	Obtenez jusqu'à 30% de réduction	\N	f	Link	Spree::Taxon	26	\N	63	112	113	3	3	2022-07-12 18:16:05.839121	2022-07-12 18:16:07.222827
63	Promos	\N	\N	f	Container	URL	\N	promo	57	109	114	2	3	2022-07-12 18:16:05.453159	2022-07-12 18:16:07.222827
66	Nouvelle collection	Été 2022	\N	f	Link	Spree::Taxon	24	\N	63	110	111	3	3	2022-07-12 18:16:05.691651	2022-07-12 18:16:07.222827
71	Offres spéciales	Obtenez jusqu'à 30% de réduction	\N	f	Link	Spree::Taxon	26	\N	65	146	147	3	3	2022-07-12 18:16:06.501372	2022-07-12 18:16:08.011218
62	Catégories	\N	\N	f	Container	URL	\N	category	59	135	142	2	3	2022-07-12 18:16:05.37491	2022-07-12 18:16:08.093736
72	Jupes	\N	\N	f	Link	Spree::Taxon	9	\N	60	96	97	3	3	2022-07-12 18:16:06.60538	2022-07-12 18:16:06.675428
73	Robes	\N	\N	f	Link	Spree::Taxon	10	\N	60	98	99	3	3	2022-07-12 18:16:06.709929	2022-07-12 18:16:06.778611
253	Jackets and Coats	\N	\N	f	Link	Spree::Taxon	14	\N	236	474	475	3	11	2022-07-12 18:16:27.116728	2022-07-12 18:16:27.266463
250	Skirts and Blouses	\N	\N	f	Link	Spree::Taxon	11	\N	236	468	469	3	11	2022-07-12 18:16:26.733256	2022-07-12 18:16:26.81566
74	Jupes et chemisiers	\N	\N	f	Link	Spree::Taxon	11	\N	60	100	101	3	3	2022-07-12 18:16:06.81252	2022-07-12 18:16:06.881393
75	Chandails	\N	\N	f	Link	Spree::Taxon	12	\N	60	102	103	3	3	2022-07-12 18:16:06.940046	2022-07-12 18:16:07.052828
76	Hauts et T-shirts	\N	\N	f	Link	Spree::Taxon	13	\N	60	104	105	3	3	2022-07-12 18:16:07.09216	2022-07-12 18:16:07.166314
252	Tops and T-Shirts	\N	\N	f	Link	Spree::Taxon	13	\N	236	472	473	3	11	2022-07-12 18:16:26.988478	2022-07-12 18:16:27.073753
251	Sweaters	\N	\N	f	Link	Spree::Taxon	12	\N	236	470	471	3	11	2022-07-12 18:16:26.857262	2022-07-12 18:16:26.939308
79	T-Shirts	\N	\N	f	Link	Spree::Taxon	6	\N	61	120	121	3	3	2022-07-12 18:16:07.421984	2022-07-12 18:16:07.497292
77	Vestes et manteaux	\N	\N	f	Link	Spree::Taxon	14	\N	60	106	107	3	3	2022-07-12 18:16:07.20316	2022-07-12 18:16:07.275165
60	Catégories	\N	\N	f	Container	URL	\N	category	57	95	108	2	3	2022-07-12 18:16:05.219714	2022-07-12 18:16:07.284538
57	Femmes	\N	\N	f	Link	Spree::Taxon	3	\N	3	94	115	1	3	2022-07-12 18:16:04.88517	2022-07-12 18:16:07.284538
78	Chemises	\N	\N	f	Link	Spree::Taxon	5	\N	61	118	119	3	3	2022-07-12 18:16:07.31263	2022-07-12 18:16:07.384427
255	T-Shirts	\N	\N	f	Link	Spree::Taxon	6	\N	237	488	489	3	11	2022-07-12 18:16:27.426164	2022-07-12 18:16:27.500721
254	Shirts	\N	\N	f	Link	Spree::Taxon	5	\N	237	486	487	3	11	2022-07-12 18:16:27.305543	2022-07-12 18:16:27.389067
80	Chandails	\N	\N	f	Link	Spree::Taxon	7	\N	61	122	123	3	3	2022-07-12 18:16:07.533449	2022-07-12 18:16:07.601037
65	Promos	\N	\N	f	Container	URL	\N	promo	59	143	148	2	3	2022-07-12 18:16:05.613224	2022-07-12 18:16:08.011218
70	Nouvelle collection	Été 2022	\N	f	Link	Spree::Taxon	24	\N	65	144	145	3	3	2022-07-12 18:16:06.233898	2022-07-12 18:16:08.011218
256	Sweaters	\N	\N	f	Link	Spree::Taxon	7	\N	237	490	491	3	11	2022-07-12 18:16:27.537085	2022-07-12 18:16:27.615277
59	Tenue de sport	\N	\N	f	Link	Spree::Taxon	4	\N	3	134	149	1	3	2022-07-12 18:16:05.103421	2022-07-12 18:16:08.093736
257	Jackets and Coats	\N	\N	f	Link	Spree::Taxon	8	\N	237	492	493	3	11	2022-07-12 18:16:27.658187	2022-07-12 18:16:27.77581
258	Tops	\N	\N	f	Link	Spree::Taxon	15	\N	238	504	505	3	11	2022-07-12 18:16:27.923179	2022-07-12 18:16:28.009045
259	Sweatshirts	\N	\N	f	Link	Spree::Taxon	16	\N	238	506	507	3	11	2022-07-12 18:16:28.050368	2022-07-12 18:16:28.132145
265	Dresses	\N	\N	f	Link	Spree::Taxon	10	\N	261	523	524	2	12	2022-07-12 18:16:28.952803	2022-07-12 18:16:29.048613
246	New Collection	Summer 2022	\N	f	Link	Spree::Taxon	24	\N	241	512	513	3	11	2022-07-12 18:16:26.242962	2022-07-12 18:16:28.194392
247	Special Offers	Get up to 30% off	\N	f	Link	Spree::Taxon	26	\N	241	514	515	3	11	2022-07-12 18:16:26.368249	2022-07-12 18:16:28.194392
260	Pants	\N	\N	f	Link	Spree::Taxon	17	\N	238	508	509	3	11	2022-07-12 18:16:28.17246	2022-07-12 18:16:28.250547
11	Main Menu	\N	\N	f	Container	URL	\N	\N	\N	461	518	0	11	2022-07-12 18:15:59.791958	2022-07-12 18:16:28.260935
235	Sportswear	\N	\N	f	Link	Spree::Taxon	4	\N	11	502	517	1	11	2022-07-12 18:16:25.013426	2022-07-12 18:16:28.260935
264	Skirts	\N	\N	f	Link	Spree::Taxon	9	\N	261	521	522	2	12	2022-07-12 18:16:28.704003	2022-07-12 18:16:28.84461
266	Skirts and Blouses	\N	\N	f	Link	Spree::Taxon	11	\N	261	525	526	2	12	2022-07-12 18:16:29.107446	2022-07-12 18:16:29.247452
267	Sweaters	\N	\N	f	Link	Spree::Taxon	12	\N	261	527	528	2	12	2022-07-12 18:16:29.307422	2022-07-12 18:16:29.513812
4	Footer Menu	\N	\N	f	Container	URL	\N	\N	\N	151	184	0	4	2022-07-12 18:15:59.351844	2022-07-12 18:16:09.875256
268	Tops and T-Shirts	\N	\N	f	Link	Spree::Taxon	13	\N	261	529	530	2	12	2022-07-12 18:16:29.568456	2022-07-12 18:16:29.698394
269	Jackets and Coats	\N	\N	f	Link	Spree::Taxon	14	\N	261	531	532	2	12	2022-07-12 18:16:29.740986	2022-07-12 18:16:29.826098
261	Women	\N	\N	f	Link	Spree::Taxon	3	\N	12	520	533	1	12	2022-07-12 18:16:28.290205	2022-07-12 18:16:29.837157
270	Shirts	\N	\N	f	Link	Spree::Taxon	5	\N	262	535	536	2	12	2022-07-12 18:16:29.867127	2022-07-12 18:16:29.979811
271	T-Shirts	\N	\N	f	Link	Spree::Taxon	6	\N	262	537	538	2	12	2022-07-12 18:16:30.057084	2022-07-12 18:16:30.171433
272	Sweaters	\N	\N	f	Link	Spree::Taxon	7	\N	262	539	540	2	12	2022-07-12 18:16:30.239274	2022-07-12 18:16:30.321534
273	Jackets and Coats	\N	\N	f	Link	Spree::Taxon	8	\N	262	541	542	2	12	2022-07-12 18:16:30.361799	2022-07-12 18:16:30.446263
262	Men	\N	\N	f	Link	Spree::Taxon	2	\N	12	534	543	1	12	2022-07-12 18:16:28.421665	2022-07-12 18:16:30.457717
263	Sportswear	\N	\N	f	Link	Spree::Taxon	4	\N	12	544	551	1	12	2022-07-12 18:16:28.5416	2022-07-12 18:16:30.914075
3	Main Menu	\N	\N	f	Container	URL	\N	\N	\N	93	150	0	3	2022-07-12 18:15:59.2857	2022-07-12 18:16:08.093736
276	Pants	\N	\N	f	Link	Spree::Taxon	17	\N	263	549	550	2	12	2022-07-12 18:16:30.804071	2022-07-12 18:16:30.897248
274	Tops	\N	\N	f	Link	Spree::Taxon	15	\N	263	545	546	2	12	2022-07-12 18:16:30.488522	2022-07-12 18:16:30.610162
81	Vestes et manteaux	\N	\N	f	Link	Spree::Taxon	8	\N	61	124	125	3	3	2022-07-12 18:16:07.634685	2022-07-12 18:16:07.704586
12	Footer Menu	\N	\N	f	Container	URL	\N	\N	\N	519	552	0	12	2022-07-12 18:15:59.858026	2022-07-12 18:16:30.914075
61	Catégories	\N	\N	f	Container	URL	\N	category	58	117	126	2	3	2022-07-12 18:16:05.295846	2022-07-12 18:16:07.714091
58	Hommes	\N	\N	f	Link	Spree::Taxon	2	\N	3	116	133	1	3	2022-07-12 18:16:04.99253	2022-07-12 18:16:07.714091
275	Sweatshirts	\N	\N	f	Link	Spree::Taxon	16	\N	263	547	548	2	12	2022-07-12 18:16:30.650545	2022-07-12 18:16:30.757938
82	Hauts	\N	\N	f	Link	Spree::Taxon	15	\N	62	136	137	3	3	2022-07-12 18:16:07.739879	2022-07-12 18:16:07.810092
83	Pulls molletonnés	\N	\N	f	Link	Spree::Taxon	16	\N	62	138	139	3	3	2022-07-12 18:16:07.844326	2022-07-12 18:16:07.931703
88	Jupes	\N	\N	f	Link	Spree::Taxon	9	\N	85	153	154	2	4	2022-07-12 18:16:08.464494	2022-07-12 18:16:08.543847
84	Pantalon	\N	\N	f	Link	Spree::Taxon	17	\N	62	140	141	3	3	2022-07-12 18:16:07.973213	2022-07-12 18:16:08.083199
90	Jupes et chemisiers	\N	\N	f	Link	Spree::Taxon	11	\N	85	157	158	2	4	2022-07-12 18:16:08.689086	2022-07-12 18:16:08.760486
89	Robes	\N	\N	f	Link	Spree::Taxon	10	\N	85	155	156	2	4	2022-07-12 18:16:08.582004	2022-07-12 18:16:08.653533
92	Hauts et T-shirts	\N	\N	f	Link	Spree::Taxon	13	\N	85	161	162	2	4	2022-07-12 18:16:08.916718	2022-07-12 18:16:08.996008
91	Chandails	\N	\N	f	Link	Spree::Taxon	12	\N	85	159	160	2	4	2022-07-12 18:16:08.795268	2022-07-12 18:16:08.873268
94	Chemises	\N	\N	f	Link	Spree::Taxon	5	\N	86	167	168	2	4	2022-07-12 18:16:09.152042	2022-07-12 18:16:09.22416
93	Vestes et manteaux	\N	\N	f	Link	Spree::Taxon	14	\N	85	163	164	2	4	2022-07-12 18:16:09.041799	2022-07-12 18:16:09.11485
85	Femmes	\N	\N	f	Link	Spree::Taxon	3	\N	4	152	165	1	4	2022-07-12 18:16:08.123484	2022-07-12 18:16:09.124892
96	Chandails	\N	\N	f	Link	Spree::Taxon	7	\N	86	171	172	2	4	2022-07-12 18:16:09.368805	2022-07-12 18:16:09.438882
95	T-Shirts	\N	\N	f	Link	Spree::Taxon	6	\N	86	169	170	2	4	2022-07-12 18:16:09.261081	2022-07-12 18:16:09.333466
97	Vestes et manteaux	\N	\N	f	Link	Spree::Taxon	8	\N	86	173	174	2	4	2022-07-12 18:16:09.47464	2022-07-12 18:16:09.548105
86	Hommes	\N	\N	f	Link	Spree::Taxon	2	\N	4	166	175	1	4	2022-07-12 18:16:08.237913	2022-07-12 18:16:09.558251
98	Hauts	\N	\N	f	Link	Spree::Taxon	15	\N	87	177	178	2	4	2022-07-12 18:16:09.583726	2022-07-12 18:16:09.656647
99	Pulls molletonnés	\N	\N	f	Link	Spree::Taxon	16	\N	87	179	180	2	4	2022-07-12 18:16:09.692311	2022-07-12 18:16:09.762977
100	Pantalon	\N	\N	f	Link	Spree::Taxon	17	\N	87	181	182	2	4	2022-07-12 18:16:09.797261	2022-07-12 18:16:09.865739
87	Tenue de sport	\N	\N	f	Link	Spree::Taxon	4	\N	4	176	183	1	4	2022-07-12 18:16:08.346974	2022-07-12 18:16:09.875256
116	die Röcke	\N	\N	f	Link	Spree::Taxon	9	\N	104	188	189	3	5	2022-07-12 18:16:11.423866	2022-07-12 18:16:11.493519
117	Kleider	\N	\N	f	Link	Spree::Taxon	10	\N	104	190	191	3	5	2022-07-12 18:16:11.529248	2022-07-12 18:16:11.599326
111	Sonderangebote	Erhalten Sie bis zu 30% Rabatt	\N	f	Link	Spree::Taxon	26	\N	107	204	205	3	5	2022-07-12 18:16:10.869315	2022-07-12 18:16:12.006089
107	Promos	\N	\N	f	Container	URL	\N	promo	101	201	206	2	5	2022-07-12 18:16:10.490291	2022-07-12 18:16:12.006089
110	Neue Kollektion	Sommer 2022	\N	f	Link	Spree::Taxon	24	\N	107	202	203	3	5	2022-07-12 18:16:10.765806	2022-07-12 18:16:12.006089
113	Sonderangebote	Erhalten Sie bis zu 30% Rabatt	\N	f	Link	Spree::Taxon	26	\N	108	222	223	3	5	2022-07-12 18:16:11.095844	2022-07-12 18:16:12.424421
105	Kategorien	\N	\N	f	Container	URL	\N	category	102	209	218	2	5	2022-07-12 18:16:10.321303	2022-07-12 18:16:12.487164
102	Männer	\N	\N	f	Link	Spree::Taxon	2	\N	5	208	225	1	5	2022-07-12 18:16:10.015362	2022-07-12 18:16:12.487164
118	Röcke und Blusen	\N	\N	f	Link	Spree::Taxon	11	\N	104	192	193	3	5	2022-07-12 18:16:11.634012	2022-07-12 18:16:11.704194
119	Pullovers	\N	\N	f	Link	Spree::Taxon	12	\N	104	194	195	3	5	2022-07-12 18:16:11.73996	2022-07-12 18:16:11.808621
104	Kategorien	\N	\N	f	Container	URL	\N	category	101	187	200	2	5	2022-07-12 18:16:10.234709	2022-07-12 18:16:12.065465
108	Promos	\N	\N	f	Container	URL	\N	promo	102	219	224	2	5	2022-07-12 18:16:10.602541	2022-07-12 18:16:12.424421
112	Neue Kollektion	Sommer 2022	\N	f	Link	Spree::Taxon	24	\N	108	220	221	3	5	2022-07-12 18:16:10.979669	2022-07-12 18:16:12.424421
106	Kategorien	\N	\N	f	Container	URL	\N	category	103	227	234	2	5	2022-07-12 18:16:10.408599	2022-07-12 18:16:12.809825
103	Sportbekleidung	\N	\N	f	Link	Spree::Taxon	4	\N	5	226	241	1	5	2022-07-12 18:16:10.12224	2022-07-12 18:16:12.809825
109	Promos	\N	\N	f	Container	URL	\N	promo	103	235	240	2	5	2022-07-12 18:16:10.682816	2022-07-12 18:16:12.742372
114	Neue Kollektion	Sommer 2022	\N	f	Link	Spree::Taxon	24	\N	109	236	237	3	5	2022-07-12 18:16:11.21019	2022-07-12 18:16:12.742372
120	Tops und T-Shirts	\N	\N	f	Link	Spree::Taxon	13	\N	104	196	197	3	5	2022-07-12 18:16:11.873201	2022-07-12 18:16:11.949605
127	Sweatshirts	\N	\N	f	Link	Spree::Taxon	16	\N	106	230	231	3	5	2022-07-12 18:16:12.61591	2022-07-12 18:16:12.686681
121	Jacken und Mäntel	\N	\N	f	Link	Spree::Taxon	14	\N	104	198	199	3	5	2022-07-12 18:16:11.985858	2022-07-12 18:16:12.05675
101	Frauen	\N	\N	f	Link	Spree::Taxon	3	\N	5	186	207	1	5	2022-07-12 18:16:09.90295	2022-07-12 18:16:12.065465
122	Hemden	\N	\N	f	Link	Spree::Taxon	5	\N	105	210	211	3	5	2022-07-12 18:16:12.091517	2022-07-12 18:16:12.159741
123	T-Shirts	\N	\N	f	Link	Spree::Taxon	6	\N	105	212	213	3	5	2022-07-12 18:16:12.194667	2022-07-12 18:16:12.266682
124	Pullovers	\N	\N	f	Link	Spree::Taxon	7	\N	105	214	215	3	5	2022-07-12 18:16:12.301724	2022-07-12 18:16:12.370008
125	Jacken und Mäntel	\N	\N	f	Link	Spree::Taxon	8	\N	105	216	217	3	5	2022-07-12 18:16:12.405098	2022-07-12 18:16:12.477752
126	Tops	\N	\N	f	Link	Spree::Taxon	15	\N	106	228	229	3	5	2022-07-12 18:16:12.512584	2022-07-12 18:16:12.582008
115	Sonderangebote	Erhalten Sie bis zu 30% Rabatt	\N	f	Link	Spree::Taxon	26	\N	109	238	239	3	5	2022-07-12 18:16:11.314381	2022-07-12 18:16:12.742372
128	Hose	\N	\N	f	Link	Spree::Taxon	17	\N	106	232	233	3	5	2022-07-12 18:16:12.721614	2022-07-12 18:16:12.800166
5	Main Menu	\N	\N	f	Container	URL	\N	\N	\N	185	242	0	5	2022-07-12 18:15:59.415524	2022-07-12 18:16:12.809825
133	Kleider	\N	\N	f	Link	Spree::Taxon	10	\N	129	247	248	2	6	2022-07-12 18:16:13.294889	2022-07-12 18:16:13.366046
132	die Röcke	\N	\N	f	Link	Spree::Taxon	9	\N	129	245	246	2	6	2022-07-12 18:16:13.191497	2022-07-12 18:16:13.260142
139	T-Shirts	\N	\N	f	Link	Spree::Taxon	6	\N	130	261	262	2	6	2022-07-12 18:16:13.957477	2022-07-12 18:16:14.026105
134	Röcke und Blusen	\N	\N	f	Link	Spree::Taxon	11	\N	129	249	250	2	6	2022-07-12 18:16:13.402349	2022-07-12 18:16:13.472809
135	Pullovers	\N	\N	f	Link	Spree::Taxon	12	\N	129	251	252	2	6	2022-07-12 18:16:13.508149	2022-07-12 18:16:13.576544
138	Hemden	\N	\N	f	Link	Spree::Taxon	5	\N	130	259	260	2	6	2022-07-12 18:16:13.854035	2022-07-12 18:16:13.922754
136	Tops und T-Shirts	\N	\N	f	Link	Spree::Taxon	13	\N	129	253	254	2	6	2022-07-12 18:16:13.610237	2022-07-12 18:16:13.67762
137	Jacken und Mäntel	\N	\N	f	Link	Spree::Taxon	14	\N	129	255	256	2	6	2022-07-12 18:16:13.74701	2022-07-12 18:16:13.816978
129	Frauen	\N	\N	f	Link	Spree::Taxon	3	\N	6	244	257	1	6	2022-07-12 18:16:12.839446	2022-07-12 18:16:13.826884
141	Jacken und Mäntel	\N	\N	f	Link	Spree::Taxon	8	\N	130	265	266	2	6	2022-07-12 18:16:14.168722	2022-07-12 18:16:14.241009
130	Männer	\N	\N	f	Link	Spree::Taxon	2	\N	6	258	267	1	6	2022-07-12 18:16:12.948813	2022-07-12 18:16:14.254641
140	Pullovers	\N	\N	f	Link	Spree::Taxon	7	\N	130	263	264	2	6	2022-07-12 18:16:14.06157	2022-07-12 18:16:14.133058
142	Tops	\N	\N	f	Link	Spree::Taxon	15	\N	131	269	270	2	6	2022-07-12 18:16:14.284798	2022-07-12 18:16:14.355243
143	Sweatshirts	\N	\N	f	Link	Spree::Taxon	16	\N	131	271	272	2	6	2022-07-12 18:16:14.390811	2022-07-12 18:16:14.461711
144	Hose	\N	\N	f	Link	Spree::Taxon	17	\N	131	273	274	2	6	2022-07-12 18:16:14.496562	2022-07-12 18:16:14.566241
6	Footer Menu	\N	\N	f	Container	URL	\N	\N	\N	243	276	0	6	2022-07-12 18:15:59.477991	2022-07-12 18:16:14.576037
131	Sportbekleidung	\N	\N	f	Link	Spree::Taxon	4	\N	6	268	275	1	6	2022-07-12 18:16:13.053144	2022-07-12 18:16:14.576037
147	Ropa de deporte	\N	\N	f	Link	Spree::Taxon	4	\N	7	318	333	1	7	2022-07-12 18:16:14.849262	2022-07-12 18:16:17.652974
160	Faldas	\N	\N	f	Link	Spree::Taxon	9	\N	148	280	281	3	7	2022-07-12 18:16:16.176558	2022-07-12 18:16:16.280832
154	Nueva colección	Verano 2022	\N	f	Link	Spree::Taxon	24	\N	151	294	295	3	7	2022-07-12 18:16:15.479161	2022-07-12 18:16:16.804815
155	Ofertas especiales	Obtenga hasta un 30% de descuento	\N	f	Link	Spree::Taxon	26	\N	151	296	297	3	7	2022-07-12 18:16:15.606188	2022-07-12 18:16:16.804815
157	Ofertas especiales	Obtenga hasta un 30% de descuento	\N	f	Link	Spree::Taxon	26	\N	152	314	315	3	7	2022-07-12 18:16:15.840292	2022-07-12 18:16:17.270174
152	Promos	\N	\N	f	Container	URL	\N	promo	146	311	316	2	7	2022-07-12 18:16:15.305912	2022-07-12 18:16:17.270174
149	Categorías	\N	\N	f	Container	URL	\N	category	146	301	310	2	7	2022-07-12 18:16:15.047777	2022-07-12 18:16:17.328097
146	Mujeres	\N	\N	f	Link	Spree::Taxon	2	\N	7	300	317	1	7	2022-07-12 18:16:14.740433	2022-07-12 18:16:17.328097
153	Promos	\N	\N	f	Container	URL	\N	promo	147	327	332	2	7	2022-07-12 18:16:15.391376	2022-07-12 18:16:17.588794
150	Categorías	\N	\N	f	Container	URL	\N	category	147	319	326	2	7	2022-07-12 18:16:15.131401	2022-07-12 18:16:17.652974
7	Main Menu	\N	\N	f	Container	URL	\N	\N	\N	277	334	0	7	2022-07-12 18:15:59.540908	2022-07-12 18:16:17.652974
163	Suéteres	\N	\N	f	Link	Spree::Taxon	12	\N	148	286	287	3	7	2022-07-12 18:16:16.557279	2022-07-12 18:16:16.634484
165	Chaquetas y abrigos	\N	\N	f	Link	Spree::Taxon	14	\N	148	290	291	3	7	2022-07-12 18:16:16.782451	2022-07-12 18:16:16.880138
148	Categorías	\N	\N	f	Container	URL	\N	category	145	279	292	2	7	2022-07-12 18:16:14.963312	2022-07-12 18:16:16.890465
161	Vestidos	\N	\N	f	Link	Spree::Taxon	10	\N	148	282	283	3	7	2022-07-12 18:16:16.316112	2022-07-12 18:16:16.393489
162	Faldas y blusas	\N	\N	f	Link	Spree::Taxon	11	\N	148	284	285	3	7	2022-07-12 18:16:16.431737	2022-07-12 18:16:16.51697
145	Hombres	\N	\N	f	Link	Spree::Taxon	3	\N	7	278	299	1	7	2022-07-12 18:16:14.612494	2022-07-12 18:16:16.890465
164	Tops y camisetas	\N	\N	f	Link	Spree::Taxon	13	\N	148	288	289	3	7	2022-07-12 18:16:16.670529	2022-07-12 18:16:16.743458
151	Promos	\N	\N	f	Container	URL	\N	promo	145	293	298	2	7	2022-07-12 18:16:15.215554	2022-07-12 18:16:16.804815
168	Suéteres	\N	\N	f	Link	Spree::Taxon	7	\N	149	306	307	3	7	2022-07-12 18:16:17.149096	2022-07-12 18:16:17.217896
166	Camisas	\N	\N	f	Link	Spree::Taxon	5	\N	149	302	303	3	7	2022-07-12 18:16:16.915994	2022-07-12 18:16:16.986171
167	Camisetas	\N	\N	f	Link	Spree::Taxon	6	\N	149	304	305	3	7	2022-07-12 18:16:17.022571	2022-07-12 18:16:17.113366
8	Footer Menu	\N	\N	f	Container	URL	\N	\N	\N	335	368	0	8	2022-07-12 18:15:59.602112	2022-07-12 18:16:19.494948
156	Nueva colección	Verano 2022	\N	f	Link	Spree::Taxon	24	\N	152	312	313	3	7	2022-07-12 18:16:15.726256	2022-07-12 18:16:17.270174
169	Chaquetas y abrigos	\N	\N	f	Link	Spree::Taxon	8	\N	149	308	309	3	7	2022-07-12 18:16:17.250783	2022-07-12 18:16:17.318879
170	Tops	\N	\N	f	Link	Spree::Taxon	15	\N	150	320	321	3	7	2022-07-12 18:16:17.359002	2022-07-12 18:16:17.428223
171	Sudaderas	\N	\N	f	Link	Spree::Taxon	16	\N	150	322	323	3	7	2022-07-12 18:16:17.464596	2022-07-12 18:16:17.535584
172	Pantalones	\N	\N	f	Link	Spree::Taxon	17	\N	150	324	325	3	7	2022-07-12 18:16:17.570096	2022-07-12 18:16:17.642996
158	Nueva colección	Verano 2022	\N	f	Link	Spree::Taxon	24	\N	153	328	329	3	7	2022-07-12 18:16:15.949081	2022-07-12 18:16:17.588794
159	Ofertas especiales	Obtenga hasta un 30% de descuento	\N	f	Link	Spree::Taxon	26	\N	153	330	331	3	7	2022-07-12 18:16:16.06217	2022-07-12 18:16:17.588794
9	Main Menu	\N	\N	f	Container	URL	\N	\N	\N	369	426	0	9	2022-07-12 18:15:59.662146	2022-07-12 18:16:22.692378
10	Footer Menu	\N	\N	f	Container	URL	\N	\N	\N	427	460	0	10	2022-07-12 18:15:59.726973	2022-07-12 18:16:24.660146
\.


--
-- Data for Name: spree_menus; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.spree_menus (id, name, location, locale, store_id, created_at, updated_at) FROM stdin;
3	Main Menu	header	fr	1	2022-07-12 18:15:59.278193	2022-07-12 18:16:08.096182
8	Footer Menu	footer	es	2	2022-07-12 18:15:59.595654	2022-07-12 18:16:19.497937
9	Main Menu	header	fr	2	2022-07-12 18:15:59.655887	2022-07-12 18:16:22.695835
12	Footer Menu	footer	en	3	2022-07-12 18:15:59.850698	2022-07-12 18:16:30.918084
6	Footer Menu	footer	de	2	2022-07-12 18:15:59.471447	2022-07-12 18:16:14.578473
1	Main Menu	header	en	1	2022-07-12 18:15:59.112649	2022-07-12 18:16:02.926622
7	Main Menu	header	es	2	2022-07-12 18:15:59.534298	2022-07-12 18:16:17.655939
4	Footer Menu	footer	fr	1	2022-07-12 18:15:59.344559	2022-07-12 18:16:09.877427
10	Footer Menu	footer	fr	2	2022-07-12 18:15:59.719748	2022-07-12 18:16:24.662992
5	Main Menu	header	de	2	2022-07-12 18:15:59.408425	2022-07-12 18:16:12.812342
11	Main Menu	header	en	3	2022-07-12 18:15:59.78479	2022-07-12 18:16:28.263516
2	Footer Menu	footer	en	1	2022-07-12 18:15:59.212098	2022-07-12 18:16:04.860126
\.


--
-- Data for Name: spree_oauth_access_grants; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.spree_oauth_access_grants (id, resource_owner_id, application_id, token, expires_in, redirect_uri, created_at, revoked_at, scopes, resource_owner_type) FROM stdin;
\.


--
-- Data for Name: spree_oauth_access_tokens; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.spree_oauth_access_tokens (id, resource_owner_id, application_id, token, refresh_token, expires_in, revoked_at, created_at, scopes, previous_refresh_token, resource_owner_type) FROM stdin;
1	1	1	b84602d1aee3f43be73c5de6d8b9e5eb5bb5100aaf6bcbaa04e430d043fd7947	\N	\N	\N	2022-07-12 18:19:31.696499	admin		Spree::User
\.


--
-- Data for Name: spree_oauth_applications; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.spree_oauth_applications (id, name, uid, secret, redirect_uri, scopes, confidential, created_at, updated_at) FROM stdin;
1	Admin Panel	K2iYvzyIbnMTYcWvXdb9Hvmcl17IwbIkYu4fx0Q_1JU	$2a$12$85A8XIJqto3p/9GYFRtPTO4PRIkTFqMCNy9p41NIaF6yULV3/3IRi		admin	t	2022-07-12 18:19:31.671114	2022-07-12 18:19:31.671114
\.


--
-- Data for Name: spree_option_type_prototypes; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.spree_option_type_prototypes (id, prototype_id, option_type_id, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: spree_option_types; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.spree_option_types (id, name, presentation, "position", created_at, updated_at, filterable, public_metadata, private_metadata) FROM stdin;
1	color	Color	1	2022-07-12 18:13:13.145688	2022-07-12 18:13:13.770891	t	\N	\N
2	length	Length	2	2022-07-12 18:13:13.169901	2022-07-12 18:13:13.853424	t	\N	\N
3	size	Size	3	2022-07-12 18:13:13.188637	2022-07-12 18:13:14.004039	t	\N	\N
\.


--
-- Data for Name: spree_option_value_variants; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.spree_option_value_variants (id, variant_id, option_value_id, created_at, updated_at) FROM stdin;
1	117	12	2022-07-12 18:15:12.979482	2022-07-12 18:15:12.979482
2	117	23	2022-07-12 18:15:12.987028	2022-07-12 18:15:12.987028
3	118	3	2022-07-12 18:15:13.201192	2022-07-12 18:15:13.201192
4	118	23	2022-07-12 18:15:13.207859	2022-07-12 18:15:13.207859
5	119	13	2022-07-12 18:15:13.359325	2022-07-12 18:15:13.359325
6	119	23	2022-07-12 18:15:13.365618	2022-07-12 18:15:13.365618
7	120	13	2022-07-12 18:15:13.520376	2022-07-12 18:15:13.520376
8	120	23	2022-07-12 18:15:13.525949	2022-07-12 18:15:13.525949
9	121	9	2022-07-12 18:15:13.690659	2022-07-12 18:15:13.690659
10	121	23	2022-07-12 18:15:13.697108	2022-07-12 18:15:13.697108
11	122	5	2022-07-12 18:15:13.819589	2022-07-12 18:15:13.819589
12	122	23	2022-07-12 18:15:13.825841	2022-07-12 18:15:13.825841
13	123	12	2022-07-12 18:15:13.948333	2022-07-12 18:15:13.948333
14	123	23	2022-07-12 18:15:13.954526	2022-07-12 18:15:13.954526
15	124	4	2022-07-12 18:15:14.082075	2022-07-12 18:15:14.082075
16	124	23	2022-07-12 18:15:14.089015	2022-07-12 18:15:14.089015
17	125	1	2022-07-12 18:15:14.218372	2022-07-12 18:15:14.218372
18	125	23	2022-07-12 18:15:14.224649	2022-07-12 18:15:14.224649
19	126	16	2022-07-12 18:15:14.358585	2022-07-12 18:15:14.358585
20	126	23	2022-07-12 18:15:14.364553	2022-07-12 18:15:14.364553
21	127	16	2022-07-12 18:15:14.51066	2022-07-12 18:15:14.51066
22	127	23	2022-07-12 18:15:14.517014	2022-07-12 18:15:14.517014
23	128	16	2022-07-12 18:15:14.652267	2022-07-12 18:15:14.652267
24	128	23	2022-07-12 18:15:14.658961	2022-07-12 18:15:14.658961
25	129	7	2022-07-12 18:15:14.840499	2022-07-12 18:15:14.840499
26	129	23	2022-07-12 18:15:14.846616	2022-07-12 18:15:14.846616
27	130	1	2022-07-12 18:15:14.971931	2022-07-12 18:15:14.971931
28	130	23	2022-07-12 18:15:14.978395	2022-07-12 18:15:14.978395
29	131	7	2022-07-12 18:15:15.110196	2022-07-12 18:15:15.110196
30	131	23	2022-07-12 18:15:15.116108	2022-07-12 18:15:15.116108
31	132	5	2022-07-12 18:15:15.246805	2022-07-12 18:15:15.246805
32	132	23	2022-07-12 18:15:15.25294	2022-07-12 18:15:15.25294
33	133	7	2022-07-12 18:15:15.423172	2022-07-12 18:15:15.423172
34	133	23	2022-07-12 18:15:15.429125	2022-07-12 18:15:15.429125
35	134	17	2022-07-12 18:15:15.571691	2022-07-12 18:15:15.571691
36	134	23	2022-07-12 18:15:15.578203	2022-07-12 18:15:15.578203
37	135	7	2022-07-12 18:15:15.705341	2022-07-12 18:15:15.705341
38	135	23	2022-07-12 18:15:15.711501	2022-07-12 18:15:15.711501
39	136	4	2022-07-12 18:15:15.89117	2022-07-12 18:15:15.89117
40	136	23	2022-07-12 18:15:15.897571	2022-07-12 18:15:15.897571
41	137	5	2022-07-12 18:15:16.03184	2022-07-12 18:15:16.03184
42	137	23	2022-07-12 18:15:16.038066	2022-07-12 18:15:16.038066
43	138	19	2022-07-12 18:15:16.164402	2022-07-12 18:15:16.164402
44	138	23	2022-07-12 18:15:16.17081	2022-07-12 18:15:16.17081
45	139	7	2022-07-12 18:15:16.302188	2022-07-12 18:15:16.302188
46	139	23	2022-07-12 18:15:16.308587	2022-07-12 18:15:16.308587
47	140	11	2022-07-12 18:15:16.442561	2022-07-12 18:15:16.442561
48	140	23	2022-07-12 18:15:16.449222	2022-07-12 18:15:16.449222
49	141	7	2022-07-12 18:15:16.629814	2022-07-12 18:15:16.629814
50	141	23	2022-07-12 18:15:16.6357	2022-07-12 18:15:16.6357
51	142	6	2022-07-12 18:15:16.759307	2022-07-12 18:15:16.759307
52	142	23	2022-07-12 18:15:16.76538	2022-07-12 18:15:16.76538
53	143	13	2022-07-12 18:15:16.887438	2022-07-12 18:15:16.887438
54	143	23	2022-07-12 18:15:16.893475	2022-07-12 18:15:16.893475
55	144	5	2022-07-12 18:15:17.056103	2022-07-12 18:15:17.056103
56	144	23	2022-07-12 18:15:17.064964	2022-07-12 18:15:17.064964
57	145	10	2022-07-12 18:15:17.252366	2022-07-12 18:15:17.252366
58	145	23	2022-07-12 18:15:17.258495	2022-07-12 18:15:17.258495
59	146	15	2022-07-12 18:15:17.384235	2022-07-12 18:15:17.384235
60	146	23	2022-07-12 18:15:17.39024	2022-07-12 18:15:17.39024
61	147	16	2022-07-12 18:15:17.540375	2022-07-12 18:15:17.540375
62	147	23	2022-07-12 18:15:17.546154	2022-07-12 18:15:17.546154
63	148	5	2022-07-12 18:15:17.678253	2022-07-12 18:15:17.678253
64	148	23	2022-07-12 18:15:17.684346	2022-07-12 18:15:17.684346
65	149	13	2022-07-12 18:15:17.811697	2022-07-12 18:15:17.811697
66	149	23	2022-07-12 18:15:17.818636	2022-07-12 18:15:17.818636
67	150	10	2022-07-12 18:15:18.041696	2022-07-12 18:15:18.041696
68	150	23	2022-07-12 18:15:18.048431	2022-07-12 18:15:18.048431
69	151	4	2022-07-12 18:15:18.176163	2022-07-12 18:15:18.176163
70	151	23	2022-07-12 18:15:18.182177	2022-07-12 18:15:18.182177
71	152	9	2022-07-12 18:15:18.322009	2022-07-12 18:15:18.322009
72	152	20	2022-07-12 18:15:18.328515	2022-07-12 18:15:18.328515
73	152	23	2022-07-12 18:15:18.33418	2022-07-12 18:15:18.33418
74	153	6	2022-07-12 18:15:18.483198	2022-07-12 18:15:18.483198
75	153	20	2022-07-12 18:15:18.488868	2022-07-12 18:15:18.488868
76	153	23	2022-07-12 18:15:18.494156	2022-07-12 18:15:18.494156
77	154	8	2022-07-12 18:15:18.753394	2022-07-12 18:15:18.753394
78	154	20	2022-07-12 18:15:18.760356	2022-07-12 18:15:18.760356
79	154	23	2022-07-12 18:15:18.767558	2022-07-12 18:15:18.767558
80	155	13	2022-07-12 18:15:18.927909	2022-07-12 18:15:18.927909
81	155	20	2022-07-12 18:15:18.933801	2022-07-12 18:15:18.933801
82	155	23	2022-07-12 18:15:18.939982	2022-07-12 18:15:18.939982
83	156	4	2022-07-12 18:15:19.141932	2022-07-12 18:15:19.141932
84	156	20	2022-07-12 18:15:19.147431	2022-07-12 18:15:19.147431
85	156	23	2022-07-12 18:15:19.153284	2022-07-12 18:15:19.153284
86	157	8	2022-07-12 18:15:19.312046	2022-07-12 18:15:19.312046
87	157	20	2022-07-12 18:15:19.319107	2022-07-12 18:15:19.319107
88	157	23	2022-07-12 18:15:19.325442	2022-07-12 18:15:19.325442
89	158	5	2022-07-12 18:15:19.491177	2022-07-12 18:15:19.491177
90	158	20	2022-07-12 18:15:19.496718	2022-07-12 18:15:19.496718
91	158	23	2022-07-12 18:15:19.503251	2022-07-12 18:15:19.503251
92	159	1	2022-07-12 18:15:19.658239	2022-07-12 18:15:19.658239
93	159	20	2022-07-12 18:15:19.664487	2022-07-12 18:15:19.664487
94	159	23	2022-07-12 18:15:19.670282	2022-07-12 18:15:19.670282
95	160	16	2022-07-12 18:15:19.850358	2022-07-12 18:15:19.850358
96	160	20	2022-07-12 18:15:19.856557	2022-07-12 18:15:19.856557
97	160	23	2022-07-12 18:15:19.862413	2022-07-12 18:15:19.862413
98	161	6	2022-07-12 18:15:20.055618	2022-07-12 18:15:20.055618
99	161	20	2022-07-12 18:15:20.065638	2022-07-12 18:15:20.065638
100	161	23	2022-07-12 18:15:20.071952	2022-07-12 18:15:20.071952
101	162	4	2022-07-12 18:15:20.445748	2022-07-12 18:15:20.445748
102	162	20	2022-07-12 18:15:20.45164	2022-07-12 18:15:20.45164
103	162	23	2022-07-12 18:15:20.45815	2022-07-12 18:15:20.45815
104	163	17	2022-07-12 18:15:20.611639	2022-07-12 18:15:20.611639
105	163	20	2022-07-12 18:15:20.617739	2022-07-12 18:15:20.617739
106	163	23	2022-07-12 18:15:20.623667	2022-07-12 18:15:20.623667
107	164	3	2022-07-12 18:15:20.857789	2022-07-12 18:15:20.857789
108	164	20	2022-07-12 18:15:20.863218	2022-07-12 18:15:20.863218
109	164	23	2022-07-12 18:15:20.868904	2022-07-12 18:15:20.868904
110	165	4	2022-07-12 18:15:21.065893	2022-07-12 18:15:21.065893
111	165	20	2022-07-12 18:15:21.071611	2022-07-12 18:15:21.071611
112	165	23	2022-07-12 18:15:21.076957	2022-07-12 18:15:21.076957
113	166	7	2022-07-12 18:15:21.266413	2022-07-12 18:15:21.266413
114	166	20	2022-07-12 18:15:21.272362	2022-07-12 18:15:21.272362
115	166	23	2022-07-12 18:15:21.278332	2022-07-12 18:15:21.278332
116	167	16	2022-07-12 18:15:21.523801	2022-07-12 18:15:21.523801
117	167	20	2022-07-12 18:15:21.530153	2022-07-12 18:15:21.530153
118	167	23	2022-07-12 18:15:21.535648	2022-07-12 18:15:21.535648
119	168	16	2022-07-12 18:15:21.735126	2022-07-12 18:15:21.735126
120	168	20	2022-07-12 18:15:21.741279	2022-07-12 18:15:21.741279
121	168	23	2022-07-12 18:15:21.746799	2022-07-12 18:15:21.746799
122	169	16	2022-07-12 18:15:21.941615	2022-07-12 18:15:21.941615
123	169	20	2022-07-12 18:15:21.947939	2022-07-12 18:15:21.947939
124	169	23	2022-07-12 18:15:21.953659	2022-07-12 18:15:21.953659
125	170	3	2022-07-12 18:15:22.219144	2022-07-12 18:15:22.219144
126	170	20	2022-07-12 18:15:22.226389	2022-07-12 18:15:22.226389
127	170	23	2022-07-12 18:15:22.233206	2022-07-12 18:15:22.233206
128	171	16	2022-07-12 18:15:22.651112	2022-07-12 18:15:22.651112
129	171	20	2022-07-12 18:15:22.65896	2022-07-12 18:15:22.65896
130	171	23	2022-07-12 18:15:22.66671	2022-07-12 18:15:22.66671
131	172	10	2022-07-12 18:15:23.223661	2022-07-12 18:15:23.223661
132	172	20	2022-07-12 18:15:23.230534	2022-07-12 18:15:23.230534
133	172	23	2022-07-12 18:15:23.237246	2022-07-12 18:15:23.237246
134	173	3	2022-07-12 18:15:23.415019	2022-07-12 18:15:23.415019
135	173	20	2022-07-12 18:15:23.421267	2022-07-12 18:15:23.421267
136	173	23	2022-07-12 18:15:23.427089	2022-07-12 18:15:23.427089
137	174	5	2022-07-12 18:15:23.580473	2022-07-12 18:15:23.580473
138	174	23	2022-07-12 18:15:23.587083	2022-07-12 18:15:23.587083
139	175	12	2022-07-12 18:15:23.728041	2022-07-12 18:15:23.728041
140	175	23	2022-07-12 18:15:23.734446	2022-07-12 18:15:23.734446
141	176	13	2022-07-12 18:15:23.885685	2022-07-12 18:15:23.885685
142	176	23	2022-07-12 18:15:23.891636	2022-07-12 18:15:23.891636
143	177	1	2022-07-12 18:15:24.065669	2022-07-12 18:15:24.065669
144	177	23	2022-07-12 18:15:24.073677	2022-07-12 18:15:24.073677
145	178	8	2022-07-12 18:15:24.209662	2022-07-12 18:15:24.209662
146	178	23	2022-07-12 18:15:24.216296	2022-07-12 18:15:24.216296
147	179	16	2022-07-12 18:15:24.338929	2022-07-12 18:15:24.338929
148	179	23	2022-07-12 18:15:24.345094	2022-07-12 18:15:24.345094
149	180	17	2022-07-12 18:15:24.466919	2022-07-12 18:15:24.466919
150	180	23	2022-07-12 18:15:24.472601	2022-07-12 18:15:24.472601
151	181	11	2022-07-12 18:15:24.602243	2022-07-12 18:15:24.602243
152	181	23	2022-07-12 18:15:24.608	2022-07-12 18:15:24.608
153	182	17	2022-07-12 18:15:24.775618	2022-07-12 18:15:24.775618
154	182	23	2022-07-12 18:15:24.782591	2022-07-12 18:15:24.782591
155	183	1	2022-07-12 18:15:24.945176	2022-07-12 18:15:24.945176
156	183	23	2022-07-12 18:15:24.952317	2022-07-12 18:15:24.952317
157	184	17	2022-07-12 18:15:25.077682	2022-07-12 18:15:25.077682
158	184	23	2022-07-12 18:15:25.083973	2022-07-12 18:15:25.083973
159	185	6	2022-07-12 18:15:25.240577	2022-07-12 18:15:25.240577
160	185	23	2022-07-12 18:15:25.246936	2022-07-12 18:15:25.246936
161	186	12	2022-07-12 18:15:25.386647	2022-07-12 18:15:25.386647
162	186	23	2022-07-12 18:15:25.393564	2022-07-12 18:15:25.393564
163	187	3	2022-07-12 18:15:25.603056	2022-07-12 18:15:25.603056
164	187	23	2022-07-12 18:15:25.609006	2022-07-12 18:15:25.609006
165	188	5	2022-07-12 18:15:25.740555	2022-07-12 18:15:25.740555
166	188	23	2022-07-12 18:15:25.746577	2022-07-12 18:15:25.746577
167	189	12	2022-07-12 18:15:25.869288	2022-07-12 18:15:25.869288
168	189	23	2022-07-12 18:15:25.87543	2022-07-12 18:15:25.87543
169	190	12	2022-07-12 18:15:26.075343	2022-07-12 18:15:26.075343
170	190	23	2022-07-12 18:15:26.085144	2022-07-12 18:15:26.085144
171	191	3	2022-07-12 18:15:26.291383	2022-07-12 18:15:26.291383
172	191	23	2022-07-12 18:15:26.297469	2022-07-12 18:15:26.297469
173	192	3	2022-07-12 18:15:26.443743	2022-07-12 18:15:26.443743
174	192	23	2022-07-12 18:15:26.450196	2022-07-12 18:15:26.450196
175	193	1	2022-07-12 18:15:26.571533	2022-07-12 18:15:26.571533
176	193	23	2022-07-12 18:15:26.57738	2022-07-12 18:15:26.57738
177	194	4	2022-07-12 18:15:26.734685	2022-07-12 18:15:26.734685
178	194	23	2022-07-12 18:15:26.740541	2022-07-12 18:15:26.740541
179	195	10	2022-07-12 18:15:26.858823	2022-07-12 18:15:26.858823
180	195	23	2022-07-12 18:15:26.864298	2022-07-12 18:15:26.864298
181	196	7	2022-07-12 18:15:27.004572	2022-07-12 18:15:27.004572
182	196	23	2022-07-12 18:15:27.011472	2022-07-12 18:15:27.011472
183	197	4	2022-07-12 18:15:27.153274	2022-07-12 18:15:27.153274
184	197	23	2022-07-12 18:15:27.159434	2022-07-12 18:15:27.159434
185	198	1	2022-07-12 18:15:27.29244	2022-07-12 18:15:27.29244
186	198	23	2022-07-12 18:15:27.299614	2022-07-12 18:15:27.299614
187	199	1	2022-07-12 18:15:27.435164	2022-07-12 18:15:27.435164
188	199	23	2022-07-12 18:15:27.440644	2022-07-12 18:15:27.440644
189	200	6	2022-07-12 18:15:27.562642	2022-07-12 18:15:27.562642
190	200	23	2022-07-12 18:15:27.568733	2022-07-12 18:15:27.568733
191	201	17	2022-07-12 18:15:27.82506	2022-07-12 18:15:27.82506
192	201	23	2022-07-12 18:15:27.832002	2022-07-12 18:15:27.832002
193	202	13	2022-07-12 18:15:28.012675	2022-07-12 18:15:28.012675
194	202	23	2022-07-12 18:15:28.02025	2022-07-12 18:15:28.02025
195	203	1	2022-07-12 18:15:28.175519	2022-07-12 18:15:28.175519
196	203	23	2022-07-12 18:15:28.181272	2022-07-12 18:15:28.181272
197	204	10	2022-07-12 18:15:28.304977	2022-07-12 18:15:28.304977
198	204	23	2022-07-12 18:15:28.310655	2022-07-12 18:15:28.310655
199	205	1	2022-07-12 18:15:28.428922	2022-07-12 18:15:28.428922
200	205	23	2022-07-12 18:15:28.43436	2022-07-12 18:15:28.43436
201	206	12	2022-07-12 18:15:28.550237	2022-07-12 18:15:28.550237
202	206	23	2022-07-12 18:15:28.560057	2022-07-12 18:15:28.560057
203	207	16	2022-07-12 18:15:28.689225	2022-07-12 18:15:28.689225
204	207	23	2022-07-12 18:15:28.695367	2022-07-12 18:15:28.695367
205	208	1	2022-07-12 18:15:28.835382	2022-07-12 18:15:28.835382
206	208	23	2022-07-12 18:15:28.841489	2022-07-12 18:15:28.841489
207	209	4	2022-07-12 18:15:28.971043	2022-07-12 18:15:28.971043
208	209	23	2022-07-12 18:15:28.976522	2022-07-12 18:15:28.976522
209	210	9	2022-07-12 18:15:29.105057	2022-07-12 18:15:29.105057
210	210	23	2022-07-12 18:15:29.111977	2022-07-12 18:15:29.111977
211	211	12	2022-07-12 18:15:29.273063	2022-07-12 18:15:29.273063
212	211	23	2022-07-12 18:15:29.279824	2022-07-12 18:15:29.279824
213	212	14	2022-07-12 18:15:29.411389	2022-07-12 18:15:29.411389
214	212	23	2022-07-12 18:15:29.417503	2022-07-12 18:15:29.417503
215	213	7	2022-07-12 18:15:29.540342	2022-07-12 18:15:29.540342
216	213	23	2022-07-12 18:15:29.546491	2022-07-12 18:15:29.546491
217	214	11	2022-07-12 18:15:29.698317	2022-07-12 18:15:29.698317
218	214	23	2022-07-12 18:15:29.705027	2022-07-12 18:15:29.705027
219	215	17	2022-07-12 18:15:29.88163	2022-07-12 18:15:29.88163
220	215	23	2022-07-12 18:15:29.887999	2022-07-12 18:15:29.887999
221	216	4	2022-07-12 18:15:30.039713	2022-07-12 18:15:30.039713
222	216	23	2022-07-12 18:15:30.046279	2022-07-12 18:15:30.046279
223	217	4	2022-07-12 18:15:30.180371	2022-07-12 18:15:30.180371
224	217	23	2022-07-12 18:15:30.186041	2022-07-12 18:15:30.186041
225	218	4	2022-07-12 18:15:30.309106	2022-07-12 18:15:30.309106
226	218	23	2022-07-12 18:15:30.314984	2022-07-12 18:15:30.314984
227	219	6	2022-07-12 18:15:30.439984	2022-07-12 18:15:30.439984
228	219	23	2022-07-12 18:15:30.446223	2022-07-12 18:15:30.446223
229	220	9	2022-07-12 18:15:30.620958	2022-07-12 18:15:30.620958
230	220	23	2022-07-12 18:15:30.626982	2022-07-12 18:15:30.626982
231	221	16	2022-07-12 18:15:30.78341	2022-07-12 18:15:30.78341
232	221	23	2022-07-12 18:15:30.789472	2022-07-12 18:15:30.789472
233	222	7	2022-07-12 18:15:30.9091	2022-07-12 18:15:30.9091
234	222	23	2022-07-12 18:15:30.915092	2022-07-12 18:15:30.915092
235	223	17	2022-07-12 18:15:31.038576	2022-07-12 18:15:31.038576
236	223	23	2022-07-12 18:15:31.044516	2022-07-12 18:15:31.044516
237	224	12	2022-07-12 18:15:31.1723	2022-07-12 18:15:31.1723
238	224	23	2022-07-12 18:15:31.178106	2022-07-12 18:15:31.178106
239	225	2	2022-07-12 18:15:31.320601	2022-07-12 18:15:31.320601
240	225	23	2022-07-12 18:15:31.326731	2022-07-12 18:15:31.326731
241	226	16	2022-07-12 18:15:31.453761	2022-07-12 18:15:31.453761
242	226	23	2022-07-12 18:15:31.460209	2022-07-12 18:15:31.460209
243	227	4	2022-07-12 18:15:31.635345	2022-07-12 18:15:31.635345
244	227	23	2022-07-12 18:15:31.641251	2022-07-12 18:15:31.641251
245	228	4	2022-07-12 18:15:31.778017	2022-07-12 18:15:31.778017
246	228	23	2022-07-12 18:15:31.784515	2022-07-12 18:15:31.784515
247	229	4	2022-07-12 18:15:31.925613	2022-07-12 18:15:31.925613
248	229	23	2022-07-12 18:15:31.931674	2022-07-12 18:15:31.931674
249	230	7	2022-07-12 18:15:32.0531	2022-07-12 18:15:32.0531
250	230	23	2022-07-12 18:15:32.058733	2022-07-12 18:15:32.058733
251	231	17	2022-07-12 18:15:32.182224	2022-07-12 18:15:32.182224
252	231	23	2022-07-12 18:15:32.188476	2022-07-12 18:15:32.188476
253	232	12	2022-07-12 18:15:32.335519	2022-07-12 18:15:32.335519
254	232	23	2022-07-12 18:15:32.341117	2022-07-12 18:15:32.341117
\.


--
-- Data for Name: spree_option_values; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.spree_option_values (id, "position", name, presentation, option_type_id, created_at, updated_at, public_metadata, private_metadata) FROM stdin;
1	1	white	#FFFFFF	1	2022-07-12 18:13:13.230717	2022-07-12 18:13:13.230717	\N	\N
2	2	purple	#800080	1	2022-07-12 18:13:13.283786	2022-07-12 18:13:13.283786	\N	\N
3	3	red	#FF0000	1	2022-07-12 18:13:13.313767	2022-07-12 18:13:13.313767	\N	\N
4	4	black	#000000	1	2022-07-12 18:13:13.342159	2022-07-12 18:13:13.342159	\N	\N
5	5	brown	#8B4513	1	2022-07-12 18:13:13.370351	2022-07-12 18:13:13.370351	\N	\N
6	6	green	#228C22	1	2022-07-12 18:13:13.398116	2022-07-12 18:13:13.398116	\N	\N
7	7	grey	#808080	1	2022-07-12 18:13:13.425584	2022-07-12 18:13:13.425584	\N	\N
8	8	orange	#FF8800	1	2022-07-12 18:13:13.454228	2022-07-12 18:13:13.454228	\N	\N
9	9	burgundy	#A8003B	1	2022-07-12 18:13:13.481586	2022-07-12 18:13:13.481586	\N	\N
10	10	beige	#E1C699	1	2022-07-12 18:13:13.509184	2022-07-12 18:13:13.509184	\N	\N
11	11	mint	#AAF0D1	1	2022-07-12 18:13:13.537742	2022-07-12 18:13:13.537742	\N	\N
12	12	blue	#0000FF	1	2022-07-12 18:13:13.564972	2022-07-12 18:13:13.564972	\N	\N
13	13	dark_blue	#00008b	1	2022-07-12 18:13:13.592373	2022-07-12 18:13:13.592373	\N	\N
14	14	khaki	#BDB76B	1	2022-07-12 18:13:13.619919	2022-07-12 18:13:13.619919	\N	\N
15	15	yellow	#FFFF00	1	2022-07-12 18:13:13.649318	2022-07-12 18:13:13.649318	\N	\N
16	16	light_blue	#add8e6	1	2022-07-12 18:13:13.676746	2022-07-12 18:13:13.676746	\N	\N
17	17	pink	#FFA6C9	1	2022-07-12 18:13:13.704771	2022-07-12 18:13:13.704771	\N	\N
18	18	lila	#cf9de6	1	2022-07-12 18:13:13.733176	2022-07-12 18:13:13.733176	\N	\N
19	19	ecru	#F4F2D6	1	2022-07-12 18:13:13.760093	2022-07-12 18:13:13.760093	\N	\N
20	1	mini	Mini	2	2022-07-12 18:13:13.788773	2022-07-12 18:13:13.788773	\N	\N
21	2	midi	Midi	2	2022-07-12 18:13:13.816447	2022-07-12 18:13:13.816447	\N	\N
22	3	maxi	Maxi	2	2022-07-12 18:13:13.843596	2022-07-12 18:13:13.843596	\N	\N
23	1	xs	XS	3	2022-07-12 18:13:13.876729	2022-07-12 18:13:13.876729	\N	\N
24	2	s	S	3	2022-07-12 18:13:13.905509	2022-07-12 18:13:13.905509	\N	\N
25	3	m	M	3	2022-07-12 18:13:13.935471	2022-07-12 18:13:13.935471	\N	\N
26	4	l	L	3	2022-07-12 18:13:13.964814	2022-07-12 18:13:13.964814	\N	\N
27	5	xl	XL	3	2022-07-12 18:13:13.993532	2022-07-12 18:13:13.993532	\N	\N
\.


--
-- Data for Name: spree_order_promotions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.spree_order_promotions (id, order_id, promotion_id, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: spree_orders; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.spree_orders (id, number, item_total, total, state, adjustment_total, user_id, completed_at, bill_address_id, ship_address_id, payment_total, shipment_state, payment_state, email, special_instructions, created_at, updated_at, currency, last_ip_address, created_by_id, shipment_total, additional_tax_total, promo_total, channel, included_tax_total, item_count, approver_id, approved_at, confirmation_delivered, considered_risky, token, canceled_at, canceler_id, store_id, state_lock_version, taxable_adjustment_total, non_taxable_adjustment_total, store_owner_notification_delivered, public_metadata, private_metadata) FROM stdin;
1	R123456789	24.99	27.49	complete	2.50	\N	2022-07-11 18:15:53.267702	\N	\N	0.00	pending	balance_due	spree@example.com	\N	2022-07-12 18:15:52.595288	2022-07-12 18:15:53.745168	USD	\N	\N	0.00	0.00	0.00	spree	0.00	1	\N	\N	f	f	6kwqk1CtUk2kXQ-eZ_8gNQ1657649752595	\N	\N	1	0	0.00	0.00	\N	\N	\N
2	R987654321	24.99	32.49	complete	2.50	\N	2022-07-11 18:15:53.281705	2	1	0.00	pending	balance_due	spree@example.com	\N	2022-07-12 18:15:52.636207	2022-07-12 18:15:54.144021	USD	\N	\N	5.00	0.00	0.00	spree	0.00	1	\N	\N	f	f	poKaeWdp_inQUfj83neBvA1657649752636	\N	\N	1	0	0.00	0.00	\N	\N	\N
\.


--
-- Data for Name: spree_payment_capture_events; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.spree_payment_capture_events (id, amount, payment_id, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: spree_payment_methods; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.spree_payment_methods (id, type, name, description, active, deleted_at, created_at, updated_at, display_on, auto_capture, preferences, "position", public_metadata, private_metadata) FROM stdin;
1	Spree::Gateway::Bogus	Credit Card	Bogus payment gateway.	t	\N	2022-07-12 18:13:09.810518	2022-07-12 18:13:09.833477	both	\N	---\n:dummy_key: PUBLICKEY123\n:server: test\n:test_mode: true\n	1	\N	\N
2	Spree::PaymentMethod::Check	Check	Pay by check.	t	\N	2022-07-12 18:13:09.949257	2022-07-12 18:13:09.969282	both	\N	\N	2	\N	\N
\.


--
-- Data for Name: spree_payment_methods_stores; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.spree_payment_methods_stores (payment_method_id, store_id) FROM stdin;
1	1
1	2
1	3
2	1
2	2
2	3
\.


--
-- Data for Name: spree_payments; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.spree_payments (id, amount, order_id, source_type, source_id, payment_method_id, state, response_code, avs_response, created_at, updated_at, number, cvv_response_code, cvv_response_message, public_metadata, private_metadata, intent_client_key) FROM stdin;
1	27.49	1	Spree::CreditCard	1	1	pending	12345	\N	2022-07-12 18:15:53.741751	2022-07-12 18:15:53.741751	P5XV0ZIG	\N	\N	\N	\N	\N
2	32.49	2	Spree::CreditCard	1	1	pending	12345	\N	2022-07-12 18:15:54.14059	2022-07-12 18:15:54.14059	PG2INO8P	\N	\N	\N	\N	\N
\.


--
-- Data for Name: spree_preferences; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.spree_preferences (id, value, key, created_at, updated_at) FROM stdin;
1	--- false\n	spree/auth_configuration/signout_after_password_change	2022-07-12 18:09:59.709608	2022-07-12 18:09:59.709608
\.


--
-- Data for Name: spree_prices; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.spree_prices (id, variant_id, amount, currency, deleted_at, created_at, updated_at, compare_at_amount) FROM stdin;
1	1	24.99	USD	\N	2022-07-12 18:13:17.286374	2022-07-12 18:13:17.286374	\N
2	2	65.99	USD	\N	2022-07-12 18:13:17.736961	2022-07-12 18:13:17.736961	\N
3	3	99.99	USD	\N	2022-07-12 18:13:18.112647	2022-07-12 18:13:18.112647	\N
4	4	17.99	USD	\N	2022-07-12 18:13:18.451869	2022-07-12 18:13:18.451869	\N
5	5	55.99	USD	\N	2022-07-12 18:13:18.781473	2022-07-12 18:13:18.781473	\N
6	6	74.99	USD	\N	2022-07-12 18:13:19.124775	2022-07-12 18:13:19.124775	\N
7	7	94.99	USD	\N	2022-07-12 18:13:19.465214	2022-07-12 18:13:19.465214	\N
8	8	27.99	USD	\N	2022-07-12 18:13:19.80268	2022-07-12 18:13:19.80268	\N
9	9	33.99	USD	\N	2022-07-12 18:13:20.149861	2022-07-12 18:13:20.149861	\N
10	10	87.99	USD	\N	2022-07-12 18:13:20.495717	2022-07-12 18:13:20.495717	\N
11	11	98.99	USD	\N	2022-07-12 18:13:20.824971	2022-07-12 18:13:20.824971	\N
12	12	52.99	USD	\N	2022-07-12 18:13:21.159619	2022-07-12 18:13:21.159619	\N
13	13	28.99	USD	\N	2022-07-12 18:13:21.49581	2022-07-12 18:13:21.49581	\N
14	14	18.99	USD	\N	2022-07-12 18:13:21.825212	2022-07-12 18:13:21.825212	\N
15	15	34.99	USD	\N	2022-07-12 18:13:22.181922	2022-07-12 18:13:22.181922	\N
16	16	84.99	USD	\N	2022-07-12 18:13:22.535499	2022-07-12 18:13:22.535499	\N
17	17	47.99	USD	\N	2022-07-12 18:13:23.025133	2022-07-12 18:13:23.025133	\N
18	18	10.99	USD	\N	2022-07-12 18:13:23.372619	2022-07-12 18:13:23.372619	\N
19	19	23.99	USD	\N	2022-07-12 18:13:23.729611	2022-07-12 18:13:23.729611	\N
20	20	45.99	USD	\N	2022-07-12 18:13:24.105405	2022-07-12 18:13:24.105405	\N
21	21	88.99	USD	\N	2022-07-12 18:13:24.458189	2022-07-12 18:13:24.458189	\N
22	22	93.99	USD	\N	2022-07-12 18:13:24.816942	2022-07-12 18:13:24.816942	\N
23	23	61.99	USD	\N	2022-07-12 18:13:25.164782	2022-07-12 18:13:25.164782	\N
24	24	73.99	USD	\N	2022-07-12 18:13:25.518936	2022-07-12 18:13:25.518936	\N
25	25	24.99	USD	\N	2022-07-12 18:13:25.88228	2022-07-12 18:13:25.88228	\N
26	26	67.99	USD	\N	2022-07-12 18:13:26.322382	2022-07-12 18:13:26.322382	\N
27	27	64.99	USD	\N	2022-07-12 18:13:26.688125	2022-07-12 18:13:26.688125	\N
28	28	33.99	USD	\N	2022-07-12 18:13:27.121417	2022-07-12 18:13:27.121417	\N
29	29	11.99	USD	\N	2022-07-12 18:13:27.526966	2022-07-12 18:13:27.526966	\N
30	30	44.99	USD	\N	2022-07-12 18:13:27.913244	2022-07-12 18:13:27.913244	\N
31	31	76.99	USD	\N	2022-07-12 18:13:28.376818	2022-07-12 18:13:28.376818	\N
32	32	27.99	USD	\N	2022-07-12 18:13:28.891353	2022-07-12 18:13:28.891353	\N
33	33	64.99	USD	\N	2022-07-12 18:13:29.259237	2022-07-12 18:13:29.259237	\N
34	34	35.99	USD	\N	2022-07-12 18:13:29.618661	2022-07-12 18:13:29.618661	\N
35	35	73.99	USD	\N	2022-07-12 18:13:29.987904	2022-07-12 18:13:29.987904	\N
36	36	21.99	USD	\N	2022-07-12 18:13:30.35196	2022-07-12 18:13:30.35196	\N
37	37	40.99	USD	\N	2022-07-12 18:13:30.719021	2022-07-12 18:13:30.719021	\N
38	38	62.99	USD	\N	2022-07-12 18:13:31.087147	2022-07-12 18:13:31.087147	\N
39	39	30.99	USD	\N	2022-07-12 18:13:31.451936	2022-07-12 18:13:31.451936	\N
40	40	46.99	USD	\N	2022-07-12 18:13:31.810158	2022-07-12 18:13:31.810158	\N
41	41	74.99	USD	\N	2022-07-12 18:13:32.167724	2022-07-12 18:13:32.167724	\N
42	42	17.99	USD	\N	2022-07-12 18:13:32.53143	2022-07-12 18:13:32.53143	\N
43	43	67.99	USD	\N	2022-07-12 18:13:32.889484	2022-07-12 18:13:32.889484	\N
44	44	10.99	USD	\N	2022-07-12 18:13:33.264063	2022-07-12 18:13:33.264063	\N
45	45	17.99	USD	\N	2022-07-12 18:13:33.63484	2022-07-12 18:13:33.63484	\N
46	46	14.99	USD	\N	2022-07-12 18:13:34.156174	2022-07-12 18:13:34.156174	\N
47	47	31.99	USD	\N	2022-07-12 18:13:34.535422	2022-07-12 18:13:34.535422	\N
48	48	81.99	USD	\N	2022-07-12 18:13:34.906575	2022-07-12 18:13:34.906575	\N
49	49	55.99	USD	\N	2022-07-12 18:13:35.261318	2022-07-12 18:13:35.261318	\N
50	50	23.99	USD	\N	2022-07-12 18:13:35.619038	2022-07-12 18:13:35.619038	\N
51	51	87.99	USD	\N	2022-07-12 18:13:36.000691	2022-07-12 18:13:36.000691	\N
52	52	83.99	USD	\N	2022-07-12 18:13:36.368909	2022-07-12 18:13:36.368909	\N
53	53	76.99	USD	\N	2022-07-12 18:13:36.732905	2022-07-12 18:13:36.732905	\N
54	54	36.99	USD	\N	2022-07-12 18:13:37.103462	2022-07-12 18:13:37.103462	\N
55	55	73.99	USD	\N	2022-07-12 18:13:37.459553	2022-07-12 18:13:37.459553	\N
56	56	32.99	USD	\N	2022-07-12 18:13:37.840251	2022-07-12 18:13:37.840251	\N
57	57	26.99	USD	\N	2022-07-12 18:13:38.192576	2022-07-12 18:13:38.192576	\N
58	58	91.99	USD	\N	2022-07-12 18:13:38.53718	2022-07-12 18:13:38.53718	\N
59	59	60.99	USD	\N	2022-07-12 18:13:38.883514	2022-07-12 18:13:38.883514	\N
60	60	68.99	USD	\N	2022-07-12 18:13:39.371884	2022-07-12 18:13:39.371884	\N
61	61	15.99	USD	\N	2022-07-12 18:13:39.727827	2022-07-12 18:13:39.727827	\N
62	62	28.99	USD	\N	2022-07-12 18:13:40.078491	2022-07-12 18:13:40.078491	\N
63	63	17.99	USD	\N	2022-07-12 18:13:40.411896	2022-07-12 18:13:40.411896	\N
64	64	90.99	USD	\N	2022-07-12 18:13:40.760013	2022-07-12 18:13:40.760013	\N
65	65	19.99	USD	\N	2022-07-12 18:13:41.100294	2022-07-12 18:13:41.100294	\N
66	66	72.99	USD	\N	2022-07-12 18:13:41.473148	2022-07-12 18:13:41.473148	\N
67	67	36.99	USD	\N	2022-07-12 18:13:41.834376	2022-07-12 18:13:41.834376	\N
68	68	87.99	USD	\N	2022-07-12 18:13:42.220764	2022-07-12 18:13:42.220764	\N
69	69	46.99	USD	\N	2022-07-12 18:13:42.605527	2022-07-12 18:13:42.605527	\N
70	70	34.99	USD	\N	2022-07-12 18:13:42.977034	2022-07-12 18:13:42.977034	\N
71	71	24.99	USD	\N	2022-07-12 18:13:43.333021	2022-07-12 18:13:43.333021	\N
72	72	86.99	USD	\N	2022-07-12 18:13:43.684172	2022-07-12 18:13:43.684172	\N
73	73	86.99	USD	\N	2022-07-12 18:13:44.056071	2022-07-12 18:13:44.056071	\N
74	74	17.99	USD	\N	2022-07-12 18:13:44.44715	2022-07-12 18:13:44.44715	\N
75	75	92.99	USD	\N	2022-07-12 18:13:44.993484	2022-07-12 18:13:44.993484	\N
76	76	96.99	USD	\N	2022-07-12 18:13:45.370241	2022-07-12 18:13:45.370241	\N
77	77	30.99	USD	\N	2022-07-12 18:13:45.775796	2022-07-12 18:13:45.775796	\N
78	78	40.99	USD	\N	2022-07-12 18:13:46.542221	2022-07-12 18:13:46.542221	\N
79	79	83.99	USD	\N	2022-07-12 18:13:46.984358	2022-07-12 18:13:46.984358	\N
80	80	46.99	USD	\N	2022-07-12 18:13:47.379139	2022-07-12 18:13:47.379139	\N
81	81	60.99	USD	\N	2022-07-12 18:13:47.733697	2022-07-12 18:13:47.733697	\N
82	82	37.99	USD	\N	2022-07-12 18:13:48.080211	2022-07-12 18:13:48.080211	\N
83	83	58.99	USD	\N	2022-07-12 18:13:48.454432	2022-07-12 18:13:48.454432	\N
84	84	25.99	USD	\N	2022-07-12 18:13:48.847159	2022-07-12 18:13:48.847159	\N
85	85	27.99	USD	\N	2022-07-12 18:13:49.215908	2022-07-12 18:13:49.215908	\N
86	86	43.99	USD	\N	2022-07-12 18:13:49.577379	2022-07-12 18:13:49.577379	\N
87	87	19.99	USD	\N	2022-07-12 18:13:49.956057	2022-07-12 18:13:49.956057	\N
88	88	47.99	USD	\N	2022-07-12 18:13:50.32564	2022-07-12 18:13:50.32564	\N
89	89	59.99	USD	\N	2022-07-12 18:13:50.875825	2022-07-12 18:13:50.875825	\N
90	90	28.99	USD	\N	2022-07-12 18:13:51.289975	2022-07-12 18:13:51.289975	\N
91	91	43.99	USD	\N	2022-07-12 18:13:51.741777	2022-07-12 18:13:51.741777	\N
92	92	50.99	USD	\N	2022-07-12 18:13:52.225622	2022-07-12 18:13:52.225622	\N
93	93	26.99	USD	\N	2022-07-12 18:13:52.603502	2022-07-12 18:13:52.603502	\N
94	94	13.99	USD	\N	2022-07-12 18:13:52.995319	2022-07-12 18:13:52.995319	\N
95	95	88.99	USD	\N	2022-07-12 18:13:53.358158	2022-07-12 18:13:53.358158	\N
96	96	30.99	USD	\N	2022-07-12 18:13:53.792165	2022-07-12 18:13:53.792165	\N
97	97	41.99	USD	\N	2022-07-12 18:13:54.153524	2022-07-12 18:13:54.153524	\N
98	98	37.99	USD	\N	2022-07-12 18:13:54.498676	2022-07-12 18:13:54.498676	\N
99	99	76.99	USD	\N	2022-07-12 18:13:54.853936	2022-07-12 18:13:54.853936	\N
100	100	34.99	USD	\N	2022-07-12 18:13:55.208567	2022-07-12 18:13:55.208567	\N
101	101	11.99	USD	\N	2022-07-12 18:13:55.562831	2022-07-12 18:13:55.562831	\N
102	102	29.99	USD	\N	2022-07-12 18:13:55.947975	2022-07-12 18:13:55.947975	\N
103	103	79.99	USD	\N	2022-07-12 18:13:56.371448	2022-07-12 18:13:56.371448	\N
104	104	47.99	USD	\N	2022-07-12 18:13:56.865802	2022-07-12 18:13:56.865802	\N
105	105	17.99	USD	\N	2022-07-12 18:13:57.223869	2022-07-12 18:13:57.223869	\N
106	106	52.99	USD	\N	2022-07-12 18:13:57.61041	2022-07-12 18:13:57.61041	\N
107	107	67.99	USD	\N	2022-07-12 18:13:57.984621	2022-07-12 18:13:57.984621	\N
108	108	54.99	USD	\N	2022-07-12 18:13:58.342501	2022-07-12 18:13:58.342501	\N
109	109	71.99	USD	\N	2022-07-12 18:13:58.742053	2022-07-12 18:13:58.742053	\N
110	110	73.99	USD	\N	2022-07-12 18:13:59.089122	2022-07-12 18:13:59.089122	\N
111	111	14.99	USD	\N	2022-07-12 18:13:59.442118	2022-07-12 18:13:59.442118	\N
112	112	45.99	USD	\N	2022-07-12 18:13:59.793393	2022-07-12 18:13:59.793393	\N
113	113	50.99	USD	\N	2022-07-12 18:14:00.227416	2022-07-12 18:14:00.227416	\N
114	114	45.99	USD	\N	2022-07-12 18:14:00.669118	2022-07-12 18:14:00.669118	\N
115	115	92.99	USD	\N	2022-07-12 18:14:01.024129	2022-07-12 18:14:01.024129	\N
116	116	20.99	USD	\N	2022-07-12 18:14:01.372852	2022-07-12 18:14:01.372852	\N
117	117	24.99	USD	\N	2022-07-12 18:15:12.960719	2022-07-12 18:15:12.960719	\N
118	118	65.99	USD	\N	2022-07-12 18:15:13.186012	2022-07-12 18:15:13.186012	\N
119	119	99.99	USD	\N	2022-07-12 18:15:13.346261	2022-07-12 18:15:13.346261	\N
120	120	17.99	USD	\N	2022-07-12 18:15:13.507181	2022-07-12 18:15:13.507181	\N
121	121	55.99	USD	\N	2022-07-12 18:15:13.677462	2022-07-12 18:15:13.677462	\N
122	122	74.99	USD	\N	2022-07-12 18:15:13.806607	2022-07-12 18:15:13.806607	\N
123	123	94.99	USD	\N	2022-07-12 18:15:13.93513	2022-07-12 18:15:13.93513	\N
124	124	27.99	USD	\N	2022-07-12 18:15:14.067412	2022-07-12 18:15:14.067412	\N
125	125	33.99	USD	\N	2022-07-12 18:15:14.205045	2022-07-12 18:15:14.205045	\N
126	126	87.99	USD	\N	2022-07-12 18:15:14.345429	2022-07-12 18:15:14.345429	\N
127	127	98.99	USD	\N	2022-07-12 18:15:14.498576	2022-07-12 18:15:14.498576	\N
128	128	52.99	USD	\N	2022-07-12 18:15:14.638	2022-07-12 18:15:14.638	\N
129	129	28.99	USD	\N	2022-07-12 18:15:14.825812	2022-07-12 18:15:14.825812	\N
130	130	18.99	USD	\N	2022-07-12 18:15:14.959508	2022-07-12 18:15:14.959508	\N
131	131	34.99	USD	\N	2022-07-12 18:15:15.095985	2022-07-12 18:15:15.095985	\N
132	132	84.99	USD	\N	2022-07-12 18:15:15.233638	2022-07-12 18:15:15.233638	\N
133	133	47.99	USD	\N	2022-07-12 18:15:15.409697	2022-07-12 18:15:15.409697	\N
134	134	10.99	USD	\N	2022-07-12 18:15:15.559491	2022-07-12 18:15:15.559491	\N
135	135	23.99	USD	\N	2022-07-12 18:15:15.69268	2022-07-12 18:15:15.69268	\N
136	136	45.99	USD	\N	2022-07-12 18:15:15.876406	2022-07-12 18:15:15.876406	\N
137	137	88.99	USD	\N	2022-07-12 18:15:16.018652	2022-07-12 18:15:16.018652	\N
138	138	93.99	USD	\N	2022-07-12 18:15:16.151105	2022-07-12 18:15:16.151105	\N
139	139	61.99	USD	\N	2022-07-12 18:15:16.287059	2022-07-12 18:15:16.287059	\N
140	140	73.99	USD	\N	2022-07-12 18:15:16.428215	2022-07-12 18:15:16.428215	\N
141	141	24.99	USD	\N	2022-07-12 18:15:16.617447	2022-07-12 18:15:16.617447	\N
142	142	67.99	USD	\N	2022-07-12 18:15:16.746654	2022-07-12 18:15:16.746654	\N
143	143	64.99	USD	\N	2022-07-12 18:15:16.874714	2022-07-12 18:15:16.874714	\N
144	144	33.99	USD	\N	2022-07-12 18:15:17.036703	2022-07-12 18:15:17.036703	\N
145	145	11.99	USD	\N	2022-07-12 18:15:17.239865	2022-07-12 18:15:17.239865	\N
146	146	44.99	USD	\N	2022-07-12 18:15:17.37049	2022-07-12 18:15:17.37049	\N
147	147	76.99	USD	\N	2022-07-12 18:15:17.526736	2022-07-12 18:15:17.526736	\N
148	148	27.99	USD	\N	2022-07-12 18:15:17.664591	2022-07-12 18:15:17.664591	\N
149	149	64.99	USD	\N	2022-07-12 18:15:17.798727	2022-07-12 18:15:17.798727	\N
150	150	35.99	USD	\N	2022-07-12 18:15:18.029427	2022-07-12 18:15:18.029427	\N
151	151	73.99	USD	\N	2022-07-12 18:15:18.162718	2022-07-12 18:15:18.162718	\N
152	152	21.99	USD	\N	2022-07-12 18:15:18.30946	2022-07-12 18:15:18.30946	\N
153	153	40.99	USD	\N	2022-07-12 18:15:18.470723	2022-07-12 18:15:18.470723	\N
154	154	62.99	USD	\N	2022-07-12 18:15:18.738551	2022-07-12 18:15:18.738551	\N
155	155	30.99	USD	\N	2022-07-12 18:15:18.914183	2022-07-12 18:15:18.914183	\N
156	156	46.99	USD	\N	2022-07-12 18:15:19.128858	2022-07-12 18:15:19.128858	\N
157	157	74.99	USD	\N	2022-07-12 18:15:19.298692	2022-07-12 18:15:19.298692	\N
158	158	17.99	USD	\N	2022-07-12 18:15:19.477131	2022-07-12 18:15:19.477131	\N
159	159	67.99	USD	\N	2022-07-12 18:15:19.644646	2022-07-12 18:15:19.644646	\N
160	160	10.99	USD	\N	2022-07-12 18:15:19.838121	2022-07-12 18:15:19.838121	\N
161	161	17.99	USD	\N	2022-07-12 18:15:20.043471	2022-07-12 18:15:20.043471	\N
162	162	14.99	USD	\N	2022-07-12 18:15:20.431809	2022-07-12 18:15:20.431809	\N
163	163	31.99	USD	\N	2022-07-12 18:15:20.599504	2022-07-12 18:15:20.599504	\N
164	164	81.99	USD	\N	2022-07-12 18:15:20.845072	2022-07-12 18:15:20.845072	\N
165	165	55.99	USD	\N	2022-07-12 18:15:21.05346	2022-07-12 18:15:21.05346	\N
166	166	23.99	USD	\N	2022-07-12 18:15:21.253212	2022-07-12 18:15:21.253212	\N
167	167	87.99	USD	\N	2022-07-12 18:15:21.5108	2022-07-12 18:15:21.5108	\N
168	168	83.99	USD	\N	2022-07-12 18:15:21.721701	2022-07-12 18:15:21.721701	\N
169	169	76.99	USD	\N	2022-07-12 18:15:21.928713	2022-07-12 18:15:21.928713	\N
170	170	36.99	USD	\N	2022-07-12 18:15:22.205239	2022-07-12 18:15:22.205239	\N
171	171	73.99	USD	\N	2022-07-12 18:15:22.634971	2022-07-12 18:15:22.634971	\N
172	172	32.99	USD	\N	2022-07-12 18:15:23.208666	2022-07-12 18:15:23.208666	\N
173	173	26.99	USD	\N	2022-07-12 18:15:23.400434	2022-07-12 18:15:23.400434	\N
174	174	91.99	USD	\N	2022-07-12 18:15:23.567534	2022-07-12 18:15:23.567534	\N
175	175	60.99	USD	\N	2022-07-12 18:15:23.715842	2022-07-12 18:15:23.715842	\N
176	176	68.99	USD	\N	2022-07-12 18:15:23.872604	2022-07-12 18:15:23.872604	\N
177	177	15.99	USD	\N	2022-07-12 18:15:24.049359	2022-07-12 18:15:24.049359	\N
178	178	28.99	USD	\N	2022-07-12 18:15:24.195663	2022-07-12 18:15:24.195663	\N
179	179	17.99	USD	\N	2022-07-12 18:15:24.327215	2022-07-12 18:15:24.327215	\N
180	180	90.99	USD	\N	2022-07-12 18:15:24.453558	2022-07-12 18:15:24.453558	\N
181	181	19.99	USD	\N	2022-07-12 18:15:24.589367	2022-07-12 18:15:24.589367	\N
182	182	72.99	USD	\N	2022-07-12 18:15:24.761767	2022-07-12 18:15:24.761767	\N
183	183	36.99	USD	\N	2022-07-12 18:15:24.930517	2022-07-12 18:15:24.930517	\N
184	184	87.99	USD	\N	2022-07-12 18:15:25.06461	2022-07-12 18:15:25.06461	\N
185	185	46.99	USD	\N	2022-07-12 18:15:25.225801	2022-07-12 18:15:25.225801	\N
186	186	34.99	USD	\N	2022-07-12 18:15:25.372289	2022-07-12 18:15:25.372289	\N
187	187	24.99	USD	\N	2022-07-12 18:15:25.589456	2022-07-12 18:15:25.589456	\N
188	188	86.99	USD	\N	2022-07-12 18:15:25.727523	2022-07-12 18:15:25.727523	\N
189	189	86.99	USD	\N	2022-07-12 18:15:25.857124	2022-07-12 18:15:25.857124	\N
190	190	17.99	USD	\N	2022-07-12 18:15:26.053565	2022-07-12 18:15:26.053565	\N
191	191	92.99	USD	\N	2022-07-12 18:15:26.278103	2022-07-12 18:15:26.278103	\N
192	192	96.99	USD	\N	2022-07-12 18:15:26.430962	2022-07-12 18:15:26.430962	\N
193	193	30.99	USD	\N	2022-07-12 18:15:26.558662	2022-07-12 18:15:26.558662	\N
194	194	40.99	USD	\N	2022-07-12 18:15:26.721093	2022-07-12 18:15:26.721093	\N
195	195	83.99	USD	\N	2022-07-12 18:15:26.846472	2022-07-12 18:15:26.846472	\N
196	196	46.99	USD	\N	2022-07-12 18:15:26.992713	2022-07-12 18:15:26.992713	\N
197	197	60.99	USD	\N	2022-07-12 18:15:27.138298	2022-07-12 18:15:27.138298	\N
198	198	37.99	USD	\N	2022-07-12 18:15:27.277117	2022-07-12 18:15:27.277117	\N
199	199	58.99	USD	\N	2022-07-12 18:15:27.422325	2022-07-12 18:15:27.422325	\N
200	200	25.99	USD	\N	2022-07-12 18:15:27.549985	2022-07-12 18:15:27.549985	\N
201	201	27.99	USD	\N	2022-07-12 18:15:27.812312	2022-07-12 18:15:27.812312	\N
202	202	43.99	USD	\N	2022-07-12 18:15:27.999891	2022-07-12 18:15:27.999891	\N
203	203	19.99	USD	\N	2022-07-12 18:15:28.161836	2022-07-12 18:15:28.161836	\N
204	204	47.99	USD	\N	2022-07-12 18:15:28.292114	2022-07-12 18:15:28.292114	\N
205	205	59.99	USD	\N	2022-07-12 18:15:28.415842	2022-07-12 18:15:28.415842	\N
206	206	28.99	USD	\N	2022-07-12 18:15:28.538204	2022-07-12 18:15:28.538204	\N
207	207	43.99	USD	\N	2022-07-12 18:15:28.673484	2022-07-12 18:15:28.673484	\N
208	208	50.99	USD	\N	2022-07-12 18:15:28.822309	2022-07-12 18:15:28.822309	\N
209	209	26.99	USD	\N	2022-07-12 18:15:28.959356	2022-07-12 18:15:28.959356	\N
210	210	13.99	USD	\N	2022-07-12 18:15:29.092132	2022-07-12 18:15:29.092132	\N
211	211	88.99	USD	\N	2022-07-12 18:15:29.258049	2022-07-12 18:15:29.258049	\N
212	212	30.99	USD	\N	2022-07-12 18:15:29.397477	2022-07-12 18:15:29.397477	\N
213	213	41.99	USD	\N	2022-07-12 18:15:29.526761	2022-07-12 18:15:29.526761	\N
214	214	37.99	USD	\N	2022-07-12 18:15:29.685775	2022-07-12 18:15:29.685775	\N
215	215	76.99	USD	\N	2022-07-12 18:15:29.861263	2022-07-12 18:15:29.861263	\N
216	216	34.99	USD	\N	2022-07-12 18:15:30.025218	2022-07-12 18:15:30.025218	\N
217	217	11.99	USD	\N	2022-07-12 18:15:30.167086	2022-07-12 18:15:30.167086	\N
218	218	29.99	USD	\N	2022-07-12 18:15:30.295849	2022-07-12 18:15:30.295849	\N
219	219	79.99	USD	\N	2022-07-12 18:15:30.427769	2022-07-12 18:15:30.427769	\N
220	220	47.99	USD	\N	2022-07-12 18:15:30.606701	2022-07-12 18:15:30.606701	\N
221	221	17.99	USD	\N	2022-07-12 18:15:30.770882	2022-07-12 18:15:30.770882	\N
222	222	52.99	USD	\N	2022-07-12 18:15:30.896837	2022-07-12 18:15:30.896837	\N
223	223	67.99	USD	\N	2022-07-12 18:15:31.026023	2022-07-12 18:15:31.026023	\N
224	224	54.99	USD	\N	2022-07-12 18:15:31.157706	2022-07-12 18:15:31.157706	\N
225	225	71.99	USD	\N	2022-07-12 18:15:31.307011	2022-07-12 18:15:31.307011	\N
226	226	73.99	USD	\N	2022-07-12 18:15:31.440126	2022-07-12 18:15:31.440126	\N
227	227	14.99	USD	\N	2022-07-12 18:15:31.622854	2022-07-12 18:15:31.622854	\N
228	228	45.99	USD	\N	2022-07-12 18:15:31.765392	2022-07-12 18:15:31.765392	\N
229	229	50.99	USD	\N	2022-07-12 18:15:31.912612	2022-07-12 18:15:31.912612	\N
230	230	45.99	USD	\N	2022-07-12 18:15:32.040412	2022-07-12 18:15:32.040412	\N
231	231	92.99	USD	\N	2022-07-12 18:15:32.16885	2022-07-12 18:15:32.16885	\N
232	232	20.99	USD	\N	2022-07-12 18:15:32.323075	2022-07-12 18:15:32.323075	\N
\.


--
-- Data for Name: spree_product_option_types; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.spree_product_option_types (id, "position", product_id, option_type_id, created_at, updated_at) FROM stdin;
1	1	1	1	2022-07-12 18:13:17.240294	2022-07-12 18:13:17.240294
2	2	1	3	2022-07-12 18:13:17.249369	2022-07-12 18:13:17.249369
3	1	2	1	2022-07-12 18:13:17.575853	2022-07-12 18:13:17.575853
4	2	2	3	2022-07-12 18:13:17.584452	2022-07-12 18:13:17.584452
5	1	3	1	2022-07-12 18:13:18.068747	2022-07-12 18:13:18.068747
6	2	3	3	2022-07-12 18:13:18.076967	2022-07-12 18:13:18.076967
7	1	4	1	2022-07-12 18:13:18.406911	2022-07-12 18:13:18.406911
8	2	4	3	2022-07-12 18:13:18.415201	2022-07-12 18:13:18.415201
9	1	5	1	2022-07-12 18:13:18.739097	2022-07-12 18:13:18.739097
10	2	5	3	2022-07-12 18:13:18.746864	2022-07-12 18:13:18.746864
11	1	6	1	2022-07-12 18:13:19.080283	2022-07-12 18:13:19.080283
12	2	6	3	2022-07-12 18:13:19.088764	2022-07-12 18:13:19.088764
13	1	7	1	2022-07-12 18:13:19.412902	2022-07-12 18:13:19.412902
14	2	7	3	2022-07-12 18:13:19.427039	2022-07-12 18:13:19.427039
15	1	8	1	2022-07-12 18:13:19.757682	2022-07-12 18:13:19.757682
16	2	8	3	2022-07-12 18:13:19.766098	2022-07-12 18:13:19.766098
17	1	9	1	2022-07-12 18:13:20.104158	2022-07-12 18:13:20.104158
18	2	9	3	2022-07-12 18:13:20.112254	2022-07-12 18:13:20.112254
19	1	10	1	2022-07-12 18:13:20.443642	2022-07-12 18:13:20.443642
20	2	10	3	2022-07-12 18:13:20.451802	2022-07-12 18:13:20.451802
21	1	11	1	2022-07-12 18:13:20.782602	2022-07-12 18:13:20.782602
22	2	11	3	2022-07-12 18:13:20.790267	2022-07-12 18:13:20.790267
23	1	12	1	2022-07-12 18:13:21.115523	2022-07-12 18:13:21.115523
24	2	12	3	2022-07-12 18:13:21.12359	2022-07-12 18:13:21.12359
25	1	13	1	2022-07-12 18:13:21.452604	2022-07-12 18:13:21.452604
26	2	13	3	2022-07-12 18:13:21.460967	2022-07-12 18:13:21.460967
27	1	14	1	2022-07-12 18:13:21.780338	2022-07-12 18:13:21.780338
28	2	14	3	2022-07-12 18:13:21.789033	2022-07-12 18:13:21.789033
29	1	15	1	2022-07-12 18:13:22.135591	2022-07-12 18:13:22.135591
30	2	15	3	2022-07-12 18:13:22.1442	2022-07-12 18:13:22.1442
31	1	16	1	2022-07-12 18:13:22.490686	2022-07-12 18:13:22.490686
32	2	16	3	2022-07-12 18:13:22.499411	2022-07-12 18:13:22.499411
33	1	17	1	2022-07-12 18:13:22.978329	2022-07-12 18:13:22.978329
34	2	17	3	2022-07-12 18:13:22.986575	2022-07-12 18:13:22.986575
35	1	18	1	2022-07-12 18:13:23.323486	2022-07-12 18:13:23.323486
36	2	18	3	2022-07-12 18:13:23.331971	2022-07-12 18:13:23.331971
37	1	19	1	2022-07-12 18:13:23.683221	2022-07-12 18:13:23.683221
38	2	19	3	2022-07-12 18:13:23.691861	2022-07-12 18:13:23.691861
39	1	20	1	2022-07-12 18:13:24.052873	2022-07-12 18:13:24.052873
40	2	20	3	2022-07-12 18:13:24.061288	2022-07-12 18:13:24.061288
41	1	21	1	2022-07-12 18:13:24.411452	2022-07-12 18:13:24.411452
42	2	21	3	2022-07-12 18:13:24.420037	2022-07-12 18:13:24.420037
43	1	22	1	2022-07-12 18:13:24.770248	2022-07-12 18:13:24.770248
44	2	22	3	2022-07-12 18:13:24.778664	2022-07-12 18:13:24.778664
45	1	23	1	2022-07-12 18:13:25.111248	2022-07-12 18:13:25.111248
46	2	23	3	2022-07-12 18:13:25.119679	2022-07-12 18:13:25.119679
47	1	24	1	2022-07-12 18:13:25.474632	2022-07-12 18:13:25.474632
48	2	24	3	2022-07-12 18:13:25.482735	2022-07-12 18:13:25.482735
49	1	25	1	2022-07-12 18:13:25.829354	2022-07-12 18:13:25.829354
50	2	25	3	2022-07-12 18:13:25.838854	2022-07-12 18:13:25.838854
51	1	26	1	2022-07-12 18:13:26.269111	2022-07-12 18:13:26.269111
52	2	26	3	2022-07-12 18:13:26.278405	2022-07-12 18:13:26.278405
53	1	27	1	2022-07-12 18:13:26.64196	2022-07-12 18:13:26.64196
54	2	27	3	2022-07-12 18:13:26.650964	2022-07-12 18:13:26.650964
55	1	28	1	2022-07-12 18:13:27.064254	2022-07-12 18:13:27.064254
56	2	28	3	2022-07-12 18:13:27.073988	2022-07-12 18:13:27.073988
57	1	29	1	2022-07-12 18:13:27.479938	2022-07-12 18:13:27.479938
58	2	29	3	2022-07-12 18:13:27.488848	2022-07-12 18:13:27.488848
59	1	30	1	2022-07-12 18:13:27.863717	2022-07-12 18:13:27.863717
60	2	30	3	2022-07-12 18:13:27.872557	2022-07-12 18:13:27.872557
61	1	31	1	2022-07-12 18:13:28.326217	2022-07-12 18:13:28.326217
62	2	31	3	2022-07-12 18:13:28.336239	2022-07-12 18:13:28.336239
63	1	32	1	2022-07-12 18:13:28.841249	2022-07-12 18:13:28.841249
64	2	32	3	2022-07-12 18:13:28.850445	2022-07-12 18:13:28.850445
65	1	33	1	2022-07-12 18:13:29.213002	2022-07-12 18:13:29.213002
66	2	33	3	2022-07-12 18:13:29.221322	2022-07-12 18:13:29.221322
67	1	34	1	2022-07-12 18:13:29.573259	2022-07-12 18:13:29.573259
68	2	34	3	2022-07-12 18:13:29.581775	2022-07-12 18:13:29.581775
69	1	35	1	2022-07-12 18:13:29.941187	2022-07-12 18:13:29.941187
70	2	35	3	2022-07-12 18:13:29.950144	2022-07-12 18:13:29.950144
71	1	36	1	2022-07-12 18:13:30.295935	2022-07-12 18:13:30.295935
72	2	36	2	2022-07-12 18:13:30.304911	2022-07-12 18:13:30.304911
73	3	36	3	2022-07-12 18:13:30.313866	2022-07-12 18:13:30.313866
74	1	37	1	2022-07-12 18:13:30.664364	2022-07-12 18:13:30.664364
75	2	37	2	2022-07-12 18:13:30.672702	2022-07-12 18:13:30.672702
76	3	37	3	2022-07-12 18:13:30.681344	2022-07-12 18:13:30.681344
77	1	38	1	2022-07-12 18:13:31.032346	2022-07-12 18:13:31.032346
78	2	38	2	2022-07-12 18:13:31.04085	2022-07-12 18:13:31.04085
79	3	38	3	2022-07-12 18:13:31.049691	2022-07-12 18:13:31.049691
80	1	39	1	2022-07-12 18:13:31.397323	2022-07-12 18:13:31.397323
81	2	39	2	2022-07-12 18:13:31.405994	2022-07-12 18:13:31.405994
82	3	39	3	2022-07-12 18:13:31.41484	2022-07-12 18:13:31.41484
83	1	40	1	2022-07-12 18:13:31.757404	2022-07-12 18:13:31.757404
84	2	40	2	2022-07-12 18:13:31.765809	2022-07-12 18:13:31.765809
85	3	40	3	2022-07-12 18:13:31.773796	2022-07-12 18:13:31.773796
86	1	41	1	2022-07-12 18:13:32.112651	2022-07-12 18:13:32.112651
87	2	41	2	2022-07-12 18:13:32.121135	2022-07-12 18:13:32.121135
88	3	41	3	2022-07-12 18:13:32.129865	2022-07-12 18:13:32.129865
89	1	42	1	2022-07-12 18:13:32.474603	2022-07-12 18:13:32.474603
90	2	42	2	2022-07-12 18:13:32.483349	2022-07-12 18:13:32.483349
91	3	42	3	2022-07-12 18:13:32.49222	2022-07-12 18:13:32.49222
92	1	43	1	2022-07-12 18:13:32.835911	2022-07-12 18:13:32.835911
93	2	43	2	2022-07-12 18:13:32.84366	2022-07-12 18:13:32.84366
94	3	43	3	2022-07-12 18:13:32.852862	2022-07-12 18:13:32.852862
95	1	44	1	2022-07-12 18:13:33.208138	2022-07-12 18:13:33.208138
96	2	44	2	2022-07-12 18:13:33.217014	2022-07-12 18:13:33.217014
97	3	44	3	2022-07-12 18:13:33.225673	2022-07-12 18:13:33.225673
98	1	45	1	2022-07-12 18:13:33.577764	2022-07-12 18:13:33.577764
99	2	45	2	2022-07-12 18:13:33.586475	2022-07-12 18:13:33.586475
100	3	45	3	2022-07-12 18:13:33.595803	2022-07-12 18:13:33.595803
101	1	46	1	2022-07-12 18:13:34.096804	2022-07-12 18:13:34.096804
102	2	46	2	2022-07-12 18:13:34.106015	2022-07-12 18:13:34.106015
103	3	46	3	2022-07-12 18:13:34.115273	2022-07-12 18:13:34.115273
104	1	47	1	2022-07-12 18:13:34.480549	2022-07-12 18:13:34.480549
105	2	47	2	2022-07-12 18:13:34.489648	2022-07-12 18:13:34.489648
106	3	47	3	2022-07-12 18:13:34.498335	2022-07-12 18:13:34.498335
107	1	48	1	2022-07-12 18:13:34.852232	2022-07-12 18:13:34.852232
108	2	48	2	2022-07-12 18:13:34.860548	2022-07-12 18:13:34.860548
109	3	48	3	2022-07-12 18:13:34.870004	2022-07-12 18:13:34.870004
110	1	49	1	2022-07-12 18:13:35.207764	2022-07-12 18:13:35.207764
111	2	49	2	2022-07-12 18:13:35.216873	2022-07-12 18:13:35.216873
112	3	49	3	2022-07-12 18:13:35.224963	2022-07-12 18:13:35.224963
113	1	50	1	2022-07-12 18:13:35.56383	2022-07-12 18:13:35.56383
114	2	50	2	2022-07-12 18:13:35.571814	2022-07-12 18:13:35.571814
115	3	50	3	2022-07-12 18:13:35.580874	2022-07-12 18:13:35.580874
116	1	51	1	2022-07-12 18:13:35.945071	2022-07-12 18:13:35.945071
117	2	51	2	2022-07-12 18:13:35.953824	2022-07-12 18:13:35.953824
118	3	51	3	2022-07-12 18:13:35.962352	2022-07-12 18:13:35.962352
119	1	52	1	2022-07-12 18:13:36.3111	2022-07-12 18:13:36.3111
120	2	52	2	2022-07-12 18:13:36.320411	2022-07-12 18:13:36.320411
121	3	52	3	2022-07-12 18:13:36.330639	2022-07-12 18:13:36.330639
122	1	53	1	2022-07-12 18:13:36.677545	2022-07-12 18:13:36.677545
123	2	53	2	2022-07-12 18:13:36.68664	2022-07-12 18:13:36.68664
124	3	53	3	2022-07-12 18:13:36.695426	2022-07-12 18:13:36.695426
125	1	54	1	2022-07-12 18:13:37.049889	2022-07-12 18:13:37.049889
126	2	54	2	2022-07-12 18:13:37.058247	2022-07-12 18:13:37.058247
127	3	54	3	2022-07-12 18:13:37.067221	2022-07-12 18:13:37.067221
128	1	55	1	2022-07-12 18:13:37.404303	2022-07-12 18:13:37.404303
129	2	55	2	2022-07-12 18:13:37.413239	2022-07-12 18:13:37.413239
130	3	55	3	2022-07-12 18:13:37.421293	2022-07-12 18:13:37.421293
131	1	56	1	2022-07-12 18:13:37.781885	2022-07-12 18:13:37.781885
132	2	56	2	2022-07-12 18:13:37.78931	2022-07-12 18:13:37.78931
133	3	56	3	2022-07-12 18:13:37.797355	2022-07-12 18:13:37.797355
134	1	57	1	2022-07-12 18:13:38.138696	2022-07-12 18:13:38.138696
135	2	57	2	2022-07-12 18:13:38.146991	2022-07-12 18:13:38.146991
136	3	57	3	2022-07-12 18:13:38.155974	2022-07-12 18:13:38.155974
137	1	58	1	2022-07-12 18:13:38.492112	2022-07-12 18:13:38.492112
138	2	58	3	2022-07-12 18:13:38.500838	2022-07-12 18:13:38.500838
139	1	59	1	2022-07-12 18:13:38.836883	2022-07-12 18:13:38.836883
140	2	59	3	2022-07-12 18:13:38.845619	2022-07-12 18:13:38.845619
141	1	60	1	2022-07-12 18:13:39.323586	2022-07-12 18:13:39.323586
142	2	60	3	2022-07-12 18:13:39.333458	2022-07-12 18:13:39.333458
143	1	61	1	2022-07-12 18:13:39.680552	2022-07-12 18:13:39.680552
144	2	61	3	2022-07-12 18:13:39.689867	2022-07-12 18:13:39.689867
145	1	62	1	2022-07-12 18:13:40.033752	2022-07-12 18:13:40.033752
146	2	62	3	2022-07-12 18:13:40.041748	2022-07-12 18:13:40.041748
147	1	63	1	2022-07-12 18:13:40.367323	2022-07-12 18:13:40.367323
148	2	63	3	2022-07-12 18:13:40.375561	2022-07-12 18:13:40.375561
149	1	64	1	2022-07-12 18:13:40.71485	2022-07-12 18:13:40.71485
150	2	64	3	2022-07-12 18:13:40.723576	2022-07-12 18:13:40.723576
151	1	65	1	2022-07-12 18:13:41.054895	2022-07-12 18:13:41.054895
152	2	65	3	2022-07-12 18:13:41.063395	2022-07-12 18:13:41.063395
153	1	66	1	2022-07-12 18:13:41.426338	2022-07-12 18:13:41.426338
154	2	66	3	2022-07-12 18:13:41.434411	2022-07-12 18:13:41.434411
155	1	67	1	2022-07-12 18:13:41.785665	2022-07-12 18:13:41.785665
156	2	67	3	2022-07-12 18:13:41.793955	2022-07-12 18:13:41.793955
157	1	68	1	2022-07-12 18:13:42.171322	2022-07-12 18:13:42.171322
158	2	68	3	2022-07-12 18:13:42.17995	2022-07-12 18:13:42.17995
159	1	69	1	2022-07-12 18:13:42.557836	2022-07-12 18:13:42.557836
160	2	69	3	2022-07-12 18:13:42.567011	2022-07-12 18:13:42.567011
161	1	70	1	2022-07-12 18:13:42.933622	2022-07-12 18:13:42.933622
162	2	70	3	2022-07-12 18:13:42.941885	2022-07-12 18:13:42.941885
163	1	71	1	2022-07-12 18:13:43.286463	2022-07-12 18:13:43.286463
164	2	71	3	2022-07-12 18:13:43.294709	2022-07-12 18:13:43.294709
165	1	72	1	2022-07-12 18:13:43.631257	2022-07-12 18:13:43.631257
166	2	72	3	2022-07-12 18:13:43.640147	2022-07-12 18:13:43.640147
167	1	73	1	2022-07-12 18:13:44.005544	2022-07-12 18:13:44.005544
168	2	73	3	2022-07-12 18:13:44.015382	2022-07-12 18:13:44.015382
169	1	74	1	2022-07-12 18:13:44.395187	2022-07-12 18:13:44.395187
170	2	74	3	2022-07-12 18:13:44.404632	2022-07-12 18:13:44.404632
171	1	75	1	2022-07-12 18:13:44.941443	2022-07-12 18:13:44.941443
172	2	75	3	2022-07-12 18:13:44.950985	2022-07-12 18:13:44.950985
173	1	76	1	2022-07-12 18:13:45.319038	2022-07-12 18:13:45.319038
174	2	76	3	2022-07-12 18:13:45.327977	2022-07-12 18:13:45.327977
175	1	77	1	2022-07-12 18:13:45.727388	2022-07-12 18:13:45.727388
176	2	77	3	2022-07-12 18:13:45.736331	2022-07-12 18:13:45.736331
177	1	78	1	2022-07-12 18:13:46.48761	2022-07-12 18:13:46.48761
178	2	78	3	2022-07-12 18:13:46.497909	2022-07-12 18:13:46.497909
179	1	79	1	2022-07-12 18:13:46.933937	2022-07-12 18:13:46.933937
180	2	79	3	2022-07-12 18:13:46.942119	2022-07-12 18:13:46.942119
181	1	80	1	2022-07-12 18:13:47.333479	2022-07-12 18:13:47.333479
182	2	80	3	2022-07-12 18:13:47.341357	2022-07-12 18:13:47.341357
183	1	81	1	2022-07-12 18:13:47.686914	2022-07-12 18:13:47.686914
184	2	81	3	2022-07-12 18:13:47.695509	2022-07-12 18:13:47.695509
185	1	82	1	2022-07-12 18:13:48.035599	2022-07-12 18:13:48.035599
186	2	82	3	2022-07-12 18:13:48.044067	2022-07-12 18:13:48.044067
187	1	83	1	2022-07-12 18:13:48.410533	2022-07-12 18:13:48.410533
188	2	83	3	2022-07-12 18:13:48.419075	2022-07-12 18:13:48.419075
189	1	84	1	2022-07-12 18:13:48.794319	2022-07-12 18:13:48.794319
190	2	84	3	2022-07-12 18:13:48.804825	2022-07-12 18:13:48.804825
191	1	85	1	2022-07-12 18:13:49.168878	2022-07-12 18:13:49.168878
192	2	85	3	2022-07-12 18:13:49.178696	2022-07-12 18:13:49.178696
193	1	86	1	2022-07-12 18:13:49.531735	2022-07-12 18:13:49.531735
194	2	86	3	2022-07-12 18:13:49.539631	2022-07-12 18:13:49.539631
195	1	87	1	2022-07-12 18:13:49.90381	2022-07-12 18:13:49.90381
196	2	87	3	2022-07-12 18:13:49.913407	2022-07-12 18:13:49.913407
197	1	88	1	2022-07-12 18:13:50.279325	2022-07-12 18:13:50.279325
198	2	88	3	2022-07-12 18:13:50.288437	2022-07-12 18:13:50.288437
199	1	89	1	2022-07-12 18:13:50.753488	2022-07-12 18:13:50.753488
200	2	89	3	2022-07-12 18:13:50.809272	2022-07-12 18:13:50.809272
201	1	90	1	2022-07-12 18:13:51.217482	2022-07-12 18:13:51.217482
202	2	90	3	2022-07-12 18:13:51.233482	2022-07-12 18:13:51.233482
203	1	91	1	2022-07-12 18:13:51.693958	2022-07-12 18:13:51.693958
204	2	91	3	2022-07-12 18:13:51.702208	2022-07-12 18:13:51.702208
205	1	92	1	2022-07-12 18:13:52.157253	2022-07-12 18:13:52.157253
206	2	92	3	2022-07-12 18:13:52.166825	2022-07-12 18:13:52.166825
207	1	93	1	2022-07-12 18:13:52.555513	2022-07-12 18:13:52.555513
208	2	93	3	2022-07-12 18:13:52.564577	2022-07-12 18:13:52.564577
209	1	94	1	2022-07-12 18:13:52.949459	2022-07-12 18:13:52.949459
210	2	94	3	2022-07-12 18:13:52.95804	2022-07-12 18:13:52.95804
211	1	95	1	2022-07-12 18:13:53.305542	2022-07-12 18:13:53.305542
212	2	95	3	2022-07-12 18:13:53.316051	2022-07-12 18:13:53.316051
213	1	96	1	2022-07-12 18:13:53.745176	2022-07-12 18:13:53.745176
214	2	96	3	2022-07-12 18:13:53.753446	2022-07-12 18:13:53.753446
215	1	97	1	2022-07-12 18:13:54.106734	2022-07-12 18:13:54.106734
216	2	97	3	2022-07-12 18:13:54.115998	2022-07-12 18:13:54.115998
217	1	98	1	2022-07-12 18:13:54.453648	2022-07-12 18:13:54.453648
218	2	98	3	2022-07-12 18:13:54.461947	2022-07-12 18:13:54.461947
219	1	99	1	2022-07-12 18:13:54.808287	2022-07-12 18:13:54.808287
220	2	99	3	2022-07-12 18:13:54.817092	2022-07-12 18:13:54.817092
221	1	100	1	2022-07-12 18:13:55.163449	2022-07-12 18:13:55.163449
222	2	100	3	2022-07-12 18:13:55.171801	2022-07-12 18:13:55.171801
223	1	101	1	2022-07-12 18:13:55.511207	2022-07-12 18:13:55.511207
224	2	101	3	2022-07-12 18:13:55.519354	2022-07-12 18:13:55.519354
225	1	102	1	2022-07-12 18:13:55.853402	2022-07-12 18:13:55.853402
226	2	102	3	2022-07-12 18:13:55.861475	2022-07-12 18:13:55.861475
227	1	103	1	2022-07-12 18:13:56.322419	2022-07-12 18:13:56.322419
228	2	103	3	2022-07-12 18:13:56.33349	2022-07-12 18:13:56.33349
229	1	104	1	2022-07-12 18:13:56.818936	2022-07-12 18:13:56.818936
230	2	104	3	2022-07-12 18:13:56.827286	2022-07-12 18:13:56.827286
231	1	105	1	2022-07-12 18:13:57.171495	2022-07-12 18:13:57.171495
232	2	105	3	2022-07-12 18:13:57.1806	2022-07-12 18:13:57.1806
233	1	106	1	2022-07-12 18:13:57.560541	2022-07-12 18:13:57.560541
234	2	106	3	2022-07-12 18:13:57.570159	2022-07-12 18:13:57.570159
235	1	107	1	2022-07-12 18:13:57.936413	2022-07-12 18:13:57.936413
236	2	107	3	2022-07-12 18:13:57.944962	2022-07-12 18:13:57.944962
237	1	108	1	2022-07-12 18:13:58.2908	2022-07-12 18:13:58.2908
238	2	108	3	2022-07-12 18:13:58.299084	2022-07-12 18:13:58.299084
239	1	109	1	2022-07-12 18:13:58.665842	2022-07-12 18:13:58.665842
240	2	109	3	2022-07-12 18:13:58.674033	2022-07-12 18:13:58.674033
241	1	110	1	2022-07-12 18:13:59.03653	2022-07-12 18:13:59.03653
242	2	110	3	2022-07-12 18:13:59.050098	2022-07-12 18:13:59.050098
243	1	111	1	2022-07-12 18:13:59.395745	2022-07-12 18:13:59.395745
244	2	111	3	2022-07-12 18:13:59.404135	2022-07-12 18:13:59.404135
245	1	112	1	2022-07-12 18:13:59.748758	2022-07-12 18:13:59.748758
246	2	112	3	2022-07-12 18:13:59.757113	2022-07-12 18:13:59.757113
247	1	113	1	2022-07-12 18:14:00.178064	2022-07-12 18:14:00.178064
248	2	113	3	2022-07-12 18:14:00.187813	2022-07-12 18:14:00.187813
249	1	114	1	2022-07-12 18:14:00.624735	2022-07-12 18:14:00.624735
250	2	114	3	2022-07-12 18:14:00.633366	2022-07-12 18:14:00.633366
251	1	115	1	2022-07-12 18:14:00.978736	2022-07-12 18:14:00.978736
252	2	115	3	2022-07-12 18:14:00.986601	2022-07-12 18:14:00.986601
253	1	116	1	2022-07-12 18:14:01.32857	2022-07-12 18:14:01.32857
254	2	116	3	2022-07-12 18:14:01.337079	2022-07-12 18:14:01.337079
\.


--
-- Data for Name: spree_product_promotion_rules; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.spree_product_promotion_rules (id, product_id, promotion_rule_id, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: spree_product_properties; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.spree_product_properties (id, value, product_id, property_id, created_at, updated_at, "position", show_property, filter_param) FROM stdin;
4	Ringer T	12	4	2022-07-12 18:14:11.045295	2022-07-12 18:14:11.045295	4	t	ringer-t
5	Short	12	5	2022-07-12 18:14:11.093229	2022-07-12 18:14:11.093229	5	t	short
8	Men's	12	8	2022-07-12 18:14:11.229764	2022-07-12 18:14:11.229764	8	t	men-s
9	Wilson	13	1	2022-07-12 18:14:11.273324	2022-07-12 18:14:11.273324	1	t	wilson
12	Baseball Jersey	13	4	2022-07-12 18:14:11.457981	2022-07-12 18:14:11.457981	4	t	baseball-jersey
13	Long	13	5	2022-07-12 18:14:11.518325	2022-07-12 18:14:11.518325	5	t	long
16	Men's	13	8	2022-07-12 18:14:11.692089	2022-07-12 18:14:11.692089	8	t	men-s
17	Wilson	14	1	2022-07-12 18:14:11.754862	2022-07-12 18:14:11.754862	1	t	wilson
20	Baseball Jersey	14	4	2022-07-12 18:14:11.919719	2022-07-12 18:14:11.919719	4	t	baseball-jersey
21	Long	14	5	2022-07-12 18:14:11.969093	2022-07-12 18:14:11.969093	5	t	long
24	Men's	14	8	2022-07-12 18:14:12.115036	2022-07-12 18:14:12.115036	8	t	men-s
28	Baseball Jersey	15	4	2022-07-12 18:14:12.336828	2022-07-12 18:14:12.336828	4	t	baseball-jersey
29	Long	15	5	2022-07-12 18:14:12.398856	2022-07-12 18:14:12.398856	5	t	long
32	Men's	15	8	2022-07-12 18:14:12.750242	2022-07-12 18:14:12.750242	8	t	men-s
33	Wilson	16	1	2022-07-12 18:14:12.819533	2022-07-12 18:14:12.819533	1	t	wilson
36	Baseball Jersey	16	4	2022-07-12 18:14:13.013512	2022-07-12 18:14:13.013512	4	t	baseball-jersey
37	Long	16	5	2022-07-12 18:14:13.096269	2022-07-12 18:14:13.096269	5	t	long
40	Men's	16	8	2022-07-12 18:14:13.281113	2022-07-12 18:14:13.281113	8	t	men-s
44	Baseball Jersey	17	4	2022-07-12 18:14:13.511214	2022-07-12 18:14:13.511214	4	t	baseball-jersey
45	Long	17	5	2022-07-12 18:14:13.561484	2022-07-12 18:14:13.561484	5	t	long
48	Men's	17	8	2022-07-12 18:14:13.718694	2022-07-12 18:14:13.718694	8	t	men-s
52	Ringer T	18	4	2022-07-12 18:14:13.91878	2022-07-12 18:14:13.91878	4	t	ringer-t
53	Short	18	5	2022-07-12 18:14:13.967968	2022-07-12 18:14:13.967968	5	t	short
56	Men's	18	8	2022-07-12 18:14:14.120511	2022-07-12 18:14:14.120511	8	t	men-s
60	Baseball Jersey	19	4	2022-07-12 18:14:14.315824	2022-07-12 18:14:14.315824	4	t	baseball-jersey
61	Long	19	5	2022-07-12 18:14:14.369726	2022-07-12 18:14:14.369726	5	t	long
64	Men's	19	8	2022-07-12 18:14:14.529635	2022-07-12 18:14:14.529635	8	t	men-s
68	Jr. Spaghetti T	76	4	2022-07-12 18:14:14.740034	2022-07-12 18:14:14.740034	4	t	jr-spaghetti-t
69	None	76	5	2022-07-12 18:14:14.788126	2022-07-12 18:14:14.788126	5	t	none
71	Form	76	7	2022-07-12 18:14:14.891563	2022-07-12 18:14:14.891563	7	t	form
72	Women's	76	8	2022-07-12 18:14:14.940076	2022-07-12 18:14:14.940076	8	t	women-s
76	Jr. Spaghetti T	77	4	2022-07-12 18:14:15.135583	2022-07-12 18:14:15.135583	4	t	jr-spaghetti-t
77	None	77	5	2022-07-12 18:14:15.181584	2022-07-12 18:14:15.181584	5	t	none
80	Women's	77	8	2022-07-12 18:14:15.32301	2022-07-12 18:14:15.32301	8	t	women-s
84	Jr. Spaghetti T	78	4	2022-07-12 18:14:15.500945	2022-07-12 18:14:15.500945	4	t	jr-spaghetti-t
58	Beta	19	2	2022-07-12 18:14:14.216609	2022-07-12 18:14:20.311684	2	t	beta
63	Form	19	7	2022-07-12 18:14:14.475822	2022-07-12 18:14:20.403536	7	t	form
59	T-shirts_basict-shirt_23.99	19	3	2022-07-12 18:14:14.263139	2022-07-12 18:14:20.466668	3	t	t-shirts_basict-shirt_23-99
18	Alpha	14	2	2022-07-12 18:14:11.812049	2022-07-12 18:14:20.638358	2	t	alpha
22	90% Cotton 10% Elastan	14	6	2022-07-12 18:14:12.017708	2022-07-12 18:14:20.71979	6	t	90-cotton-10-elastan
23	Form	14	7	2022-07-12 18:14:12.066455	2022-07-12 18:14:20.772824	7	t	form
10	Zeta	13	2	2022-07-12 18:14:11.343003	2022-07-12 18:14:21.012425	2	t	zeta
14	50% Cotton 50% Elastan	13	6	2022-07-12 18:14:11.573943	2022-07-12 18:14:21.064956	6	t	50-cotton-50-elastan
15	Lose	13	7	2022-07-12 18:14:11.630921	2022-07-12 18:14:21.119409	7	t	lose
11	T-shirts_longsleevet-shirt_28.99	13	3	2022-07-12 18:14:11.401275	2022-07-12 18:14:21.189874	3	t	t-shirts_longsleevet-shirt_28-99
34	Epsilon	16	2	2022-07-12 18:14:12.884383	2022-07-12 18:14:22.313239	2	t	epsilon
38	10% Cotton 90% Elastan	16	6	2022-07-12 18:14:13.155741	2022-07-12 18:14:22.36171	6	t	10-cotton-90-elastan
39	Lose	16	7	2022-07-12 18:14:13.218469	2022-07-12 18:14:22.410074	7	t	lose
1	Wannabe	12	1	2022-07-12 18:14:10.910206	2022-07-12 18:14:23.998214	1	t	wannabe
2	Zeta	12	2	2022-07-12 18:14:10.956139	2022-07-12 18:14:24.053193	2	t	zeta
6	50% Cotton 50% Elastan	12	6	2022-07-12 18:14:11.140473	2022-07-12 18:14:24.10893	6	t	50-cotton-50-elastan
7	Lose	12	7	2022-07-12 18:14:11.186045	2022-07-12 18:14:24.162179	7	t	lose
3	T-shirts_polot-shirt_52.99	12	3	2022-07-12 18:14:11.000963	2022-07-12 18:14:24.235395	3	t	t-shirts_polot-shirt_52-99
81	Wannabe	78	1	2022-07-12 18:14:15.369116	2022-07-12 18:14:43.172897	1	t	wannabe
82	Theta	78	2	2022-07-12 18:14:15.413061	2022-07-12 18:14:43.22004	2	t	theta
73	Wannabe	77	1	2022-07-12 18:14:14.987949	2022-07-12 18:14:43.905717	1	t	wannabe
74	Zeta	77	2	2022-07-12 18:14:15.038013	2022-07-12 18:14:43.968672	2	t	zeta
78	10% Cotton 90% Elastan	77	6	2022-07-12 18:14:15.229498	2022-07-12 18:14:44.049763	6	t	10-cotton-90-elastan
79	Lose	77	7	2022-07-12 18:14:15.275813	2022-07-12 18:14:44.101234	7	t	lose
75	TopsandT-shirts_printedt-shirt_30.99	77	3	2022-07-12 18:14:15.086865	2022-07-12 18:14:44.17093	3	t	topsandt-shirts_printedt-shirt_30-99
65	Wannabe	76	1	2022-07-12 18:14:14.595347	2022-07-12 18:14:45.459498	1	t	wannabe
66	Delta	76	2	2022-07-12 18:14:14.643307	2022-07-12 18:14:45.504074	2	t	delta
70	50% Cotton 50% Elastan	76	6	2022-07-12 18:14:14.836721	2022-07-12 18:14:45.551302	6	t	50-cotton-50-elastan
25	Wannabe	15	1	2022-07-12 18:14:12.163912	2022-07-12 18:14:59.082882	1	t	wannabe
26	Zeta	15	2	2022-07-12 18:14:12.219846	2022-07-12 18:14:59.134747	2	t	zeta
30	10% Cotton 90% Elastan	15	6	2022-07-12 18:14:12.501357	2022-07-12 18:14:59.187343	6	t	10-cotton-90-elastan
31	Lose	15	7	2022-07-12 18:14:12.618622	2022-07-12 18:14:59.240961	7	t	lose
27	T-shirts_t-shirtwithholes_34.99	15	3	2022-07-12 18:14:12.276874	2022-07-12 18:14:59.306673	3	t	t-shirts_t-shirtwithholes_34-99
49	Wannabe	18	1	2022-07-12 18:14:13.767298	2022-07-12 18:15:00.996582	1	t	wannabe
50	Theta	18	2	2022-07-12 18:14:13.820934	2022-07-12 18:15:01.052534	2	t	theta
54	90% Cotton 10% Elastan	18	6	2022-07-12 18:14:14.018844	2022-07-12 18:15:01.105795	6	t	90-cotton-10-elastan
55	Form	18	7	2022-07-12 18:14:14.071089	2022-07-12 18:15:01.158344	7	t	form
51	T-shirts_tanktop_10.99	18	3	2022-07-12 18:14:13.869784	2022-07-12 18:15:01.227707	3	t	t-shirts_tanktop_10-99
42	Epsilon	17	2	2022-07-12 18:14:13.402025	2022-07-12 18:15:04.036574	2	t	epsilon
46	90% Cotton 10% Elastan	17	6	2022-07-12 18:14:13.615531	2022-07-12 18:15:04.087225	6	t	90-cotton-10-elastan
47	Lose	17	7	2022-07-12 18:14:13.66447	2022-07-12 18:15:04.14062	7	t	lose
43	T-shirts_v-neckt-shirt_47.99	17	3	2022-07-12 18:14:13.454861	2022-07-12 18:15:04.215004	3	t	t-shirts_v-neckt-shirt_47-99
85	None	78	5	2022-07-12 18:14:15.546871	2022-07-12 18:14:15.546871	5	t	none
87	Form	78	7	2022-07-12 18:14:15.63523	2022-07-12 18:14:15.63523	7	t	form
88	Women's	78	8	2022-07-12 18:14:15.680566	2022-07-12 18:14:15.680566	8	t	women-s
89	Jerseys	79	1	2022-07-12 18:14:15.725547	2022-07-12 18:14:15.725547	1	t	jerseys
92	Jr. Spaghetti T	79	4	2022-07-12 18:14:15.88598	2022-07-12 18:14:15.88598	4	t	jr-spaghetti-t
93	None	79	5	2022-07-12 18:14:15.944123	2022-07-12 18:14:15.944123	5	t	none
96	Women's	79	8	2022-07-12 18:14:16.120459	2022-07-12 18:14:16.120459	8	t	women-s
100	Jr. Spaghetti T	80	4	2022-07-12 18:14:16.363447	2022-07-12 18:14:16.363447	4	t	jr-spaghetti-t
101	None	80	5	2022-07-12 18:14:16.416141	2022-07-12 18:14:16.416141	5	t	none
103	Form	80	7	2022-07-12 18:14:16.524765	2022-07-12 18:14:16.524765	7	t	form
104	Women's	80	8	2022-07-12 18:14:16.578163	2022-07-12 18:14:16.578163	8	t	women-s
108	Jr. Spaghetti T	81	4	2022-07-12 18:14:16.786388	2022-07-12 18:14:16.786388	4	t	jr-spaghetti-t
109	None	81	5	2022-07-12 18:14:16.836321	2022-07-12 18:14:16.836321	5	t	none
112	Women's	81	8	2022-07-12 18:14:17.012171	2022-07-12 18:14:17.012171	8	t	women-s
116	Jr. Spaghetti T	82	4	2022-07-12 18:14:17.276956	2022-07-12 18:14:17.276956	4	t	jr-spaghetti-t
117	None	82	5	2022-07-12 18:14:17.331281	2022-07-12 18:14:17.331281	5	t	none
119	Form	82	7	2022-07-12 18:14:17.443131	2022-07-12 18:14:17.443131	7	t	form
120	Women's	82	8	2022-07-12 18:14:17.504201	2022-07-12 18:14:17.504201	8	t	women-s
124	Jr. Spaghetti T	83	4	2022-07-12 18:14:17.800582	2022-07-12 18:14:17.800582	4	t	jr-spaghetti-t
125	None	83	5	2022-07-12 18:14:17.858089	2022-07-12 18:14:17.858089	5	t	none
128	Women's	83	8	2022-07-12 18:14:18.026971	2022-07-12 18:14:18.026971	8	t	women-s
132	Jr. Spaghetti T	84	4	2022-07-12 18:14:18.398346	2022-07-12 18:14:18.398346	4	t	jr-spaghetti-t
133	None	84	5	2022-07-12 18:14:18.449424	2022-07-12 18:14:18.449424	5	t	none
135	Form	84	7	2022-07-12 18:14:18.560712	2022-07-12 18:14:18.560712	7	t	form
136	Women's	84	8	2022-07-12 18:14:18.635048	2022-07-12 18:14:18.635048	8	t	women-s
137	Men	4	9	2022-07-12 18:14:18.70226	2022-07-12 18:14:18.70226	1	t	men
138	Men	4	10	2022-07-12 18:14:18.751974	2022-07-12 18:14:18.751974	2	t	men
139	Wannabe	4	1	2022-07-12 18:14:18.795921	2022-07-12 18:14:18.795921	3	t	wannabe
140	Epsilon	4	2	2022-07-12 18:14:18.848153	2022-07-12 18:14:18.848153	4	t	epsilon
141	10% Cotton 90% Elastan	4	6	2022-07-12 18:14:18.908887	2022-07-12 18:14:18.908887	5	t	10-cotton-90-elastan
142	Form	4	7	2022-07-12 18:14:18.960467	2022-07-12 18:14:18.960467	6	t	form
143	Men's	4	8	2022-07-12 18:14:19.012586	2022-07-12 18:14:19.012586	7	t	men-s
144	Shirts_slimfitshirt_17.99	4	3	2022-07-12 18:14:19.068011	2022-07-12 18:14:19.068011	8	t	shirts_slimfitshirt_17-99
145	Men	5	9	2022-07-12 18:14:19.121436	2022-07-12 18:14:19.121436	1	t	men
146	Men	5	10	2022-07-12 18:14:19.170799	2022-07-12 18:14:19.170799	2	t	men
147	Wannabe	5	1	2022-07-12 18:14:19.376526	2022-07-12 18:14:19.376526	3	t	wannabe
148	Zeta	5	2	2022-07-12 18:14:19.460151	2022-07-12 18:14:19.460151	4	t	zeta
149	50% Cotton 50% Elastan	5	6	2022-07-12 18:14:19.516796	2022-07-12 18:14:19.516796	5	t	50-cotton-50-elastan
150	Lose	5	7	2022-07-12 18:14:19.570142	2022-07-12 18:14:19.570142	6	t	lose
151	Men's	5	8	2022-07-12 18:14:19.627041	2022-07-12 18:14:19.627041	7	t	men-s
152	Shirts_shortsleeveshirt_55.99	5	3	2022-07-12 18:14:19.679034	2022-07-12 18:14:19.679034	8	t	shirts_shortsleeveshirt_55-99
153	Men	6	9	2022-07-12 18:14:19.730457	2022-07-12 18:14:19.730457	1	t	men
154	Men	6	10	2022-07-12 18:14:19.781892	2022-07-12 18:14:19.781892	2	t	men
155	Wannabe	6	1	2022-07-12 18:14:19.830441	2022-07-12 18:14:19.830441	3	t	wannabe
156	Epsilon	6	2	2022-07-12 18:14:19.879912	2022-07-12 18:14:19.879912	4	t	epsilon
157	10% Cotton 90% Elastan	6	6	2022-07-12 18:14:19.948135	2022-07-12 18:14:19.948135	5	t	10-cotton-90-elastan
158	Form	6	7	2022-07-12 18:14:19.999745	2022-07-12 18:14:19.999745	6	t	form
159	Men's	6	8	2022-07-12 18:14:20.051036	2022-07-12 18:14:20.051036	7	t	men-s
160	Shirts_printedshortsleeveshirt_74.99	6	3	2022-07-12 18:14:20.106177	2022-07-12 18:14:20.106177	8	t	shirts_printedshortsleeveshirt_74-99
161	Men	19	9	2022-07-12 18:14:20.15862	2022-07-12 18:14:20.15862	9	t	men
162	Men	19	10	2022-07-12 18:14:20.212863	2022-07-12 18:14:20.212863	10	t	men
57	Conditioned	19	1	2022-07-12 18:14:14.168952	2022-07-12 18:14:20.263975	1	t	conditioned
62	10% Cotton 90% Elastan	19	6	2022-07-12 18:14:14.423492	2022-07-12 18:14:20.35704	6	t	10-cotton-90-elastan
163	Men	14	9	2022-07-12 18:14:20.516374	2022-07-12 18:14:20.516374	9	t	men
164	Men	14	10	2022-07-12 18:14:20.572094	2022-07-12 18:14:20.572094	10	t	men
114	Delta	82	2	2022-07-12 18:14:17.166908	2022-07-12 18:14:29.192658	2	t	delta
115	TopsandT-shirts_looset-shirtwithpocketimitation_37.99	82	3	2022-07-12 18:14:17.220805	2022-07-12 18:14:29.330049	3	t	topsandt-shirts_looset-shirtwithpocketimitation_37-99
129	Wilson	84	1	2022-07-12 18:14:18.086002	2022-07-12 18:14:41.461705	1	t	wilson
130	Zeta	84	2	2022-07-12 18:14:18.143173	2022-07-12 18:14:41.510831	2	t	zeta
131	TopsandT-shirts_basiclooset-shirt_25.99	84	3	2022-07-12 18:14:18.199228	2022-07-12 18:14:41.68054	3	t	topsandt-shirts_basiclooset-shirt_25-99
121	Wannabe	83	1	2022-07-12 18:14:17.608445	2022-07-12 18:14:42.762464	1	t	wannabe
122	Zeta	83	2	2022-07-12 18:14:17.674432	2022-07-12 18:14:42.816451	2	t	zeta
126	10% Cotton 90% Elastan	83	6	2022-07-12 18:14:17.914187	2022-07-12 18:14:42.876917	6	t	10-cotton-90-elastan
127	Lose	83	7	2022-07-12 18:14:17.97044	2022-07-12 18:14:42.945322	7	t	lose
86	10% Cotton 90% Elastan	78	6	2022-07-12 18:14:15.59075	2022-07-12 18:14:43.270351	6	t	10-cotton-90-elastan
105	Resiliance	81	1	2022-07-12 18:14:16.63279	2022-07-12 18:14:43.521458	1	t	resiliance
106	Epsilon	81	2	2022-07-12 18:14:16.682897	2022-07-12 18:14:43.579004	2	t	epsilon
110	50% Cotton 50% Elastan	81	6	2022-07-12 18:14:16.890309	2022-07-12 18:14:43.628729	6	t	50-cotton-50-elastan
111	Lose	81	7	2022-07-12 18:14:16.942561	2022-07-12 18:14:43.67667	7	t	lose
107	TopsandT-shirts_croptop_60.99	81	3	2022-07-12 18:14:16.734772	2022-07-12 18:14:43.746352	3	t	topsandt-shirts_croptop_60-99
90	Beta	79	2	2022-07-12 18:14:15.777617	2022-07-12 18:15:02.770365	2	t	beta
94	90% Cotton 10% Elastan	79	6	2022-07-12 18:14:16.003032	2022-07-12 18:15:02.819132	6	t	90-cotton-10-elastan
95	Lose	79	7	2022-07-12 18:14:16.061684	2022-07-12 18:15:02.866967	7	t	lose
97	Conditioned	80	1	2022-07-12 18:14:16.173228	2022-07-12 18:15:12.170497	1	t	conditioned
98	Beta	80	2	2022-07-12 18:14:16.226733	2022-07-12 18:15:12.223666	2	t	beta
102	90% Cotton 10% Elastan	80	6	2022-07-12 18:14:16.470911	2022-07-12 18:15:12.278264	6	t	90-cotton-10-elastan
99	TopsandT-shirts_scrappycroptopwithtie_46.99	80	3	2022-07-12 18:14:16.309094	2022-07-12 18:15:12.361395	3	t	topsandt-shirts_scrappycroptopwithtie_46-99
19	T-shirts_3_4sleevet-shirt_18.99	14	3	2022-07-12 18:14:11.866438	2022-07-12 18:14:20.838958	3	t	t-shirts_3_4sleevet-shirt_18-99
165	Men	13	9	2022-07-12 18:14:20.889681	2022-07-12 18:14:20.889681	9	t	men
166	Men	13	10	2022-07-12 18:14:20.942633	2022-07-12 18:14:20.942633	10	t	men
167	Men	10	9	2022-07-12 18:14:21.244747	2022-07-12 18:14:21.244747	1	t	men
168	Men	10	10	2022-07-12 18:14:21.302411	2022-07-12 18:14:21.302411	2	t	men
169	Resiliance	10	1	2022-07-12 18:14:21.35801	2022-07-12 18:14:21.35801	3	t	resiliance
170	Zeta	10	2	2022-07-12 18:14:21.484681	2022-07-12 18:14:21.484681	4	t	zeta
171	50% Cotton 50% Elastan	10	6	2022-07-12 18:14:21.540639	2022-07-12 18:14:21.540639	5	t	50-cotton-50-elastan
172	Form	10	7	2022-07-12 18:14:21.597672	2022-07-12 18:14:21.597672	6	t	form
173	Men's	10	8	2022-07-12 18:14:21.657197	2022-07-12 18:14:21.657197	7	t	men-s
174	Shirts_linenshirt_87.99	10	3	2022-07-12 18:14:21.716777	2022-07-12 18:14:21.716777	8	t	shirts_linenshirt_87-99
175	Men	22	9	2022-07-12 18:14:21.777099	2022-07-12 18:14:21.777099	1	t	men
176	Men	22	10	2022-07-12 18:14:21.832754	2022-07-12 18:14:21.832754	2	t	men
177	Jerseys	22	1	2022-07-12 18:14:21.882969	2022-07-12 18:14:21.882969	3	t	jerseys
178	Beta	22	2	2022-07-12 18:14:21.933012	2022-07-12 18:14:21.933012	4	t	beta
179	50% Cotton 50% Elastan	22	6	2022-07-12 18:14:21.981593	2022-07-12 18:14:21.981593	5	t	50-cotton-50-elastan
180	Lose	22	7	2022-07-12 18:14:22.034576	2022-07-12 18:14:22.034576	6	t	lose
181	Men's	22	8	2022-07-12 18:14:22.086152	2022-07-12 18:14:22.086152	7	t	men-s
182	Sweaters_longsleevejumperwithpocket_93.99	22	3	2022-07-12 18:14:22.139854	2022-07-12 18:14:22.139854	8	t	sweaters_longsleevejumperwithpocket_93-99
183	Men	16	9	2022-07-12 18:14:22.194793	2022-07-12 18:14:22.194793	9	t	men
184	Men	16	10	2022-07-12 18:14:22.249301	2022-07-12 18:14:22.249301	10	t	men
35	T-shirts_raw-edget-shirt_84.99	16	3	2022-07-12 18:14:12.950955	2022-07-12 18:14:22.4727	3	t	t-shirts_raw-edget-shirt_84-99
185	Men	8	9	2022-07-12 18:14:22.529259	2022-07-12 18:14:22.529259	1	t	men
186	Men	8	10	2022-07-12 18:14:22.589205	2022-07-12 18:14:22.589205	2	t	men
187	Wannabe	8	1	2022-07-12 18:14:22.652282	2022-07-12 18:14:22.652282	3	t	wannabe
188	Zeta	8	2	2022-07-12 18:14:22.71544	2022-07-12 18:14:22.71544	4	t	zeta
189	10% Cotton 90% Elastan	8	6	2022-07-12 18:14:22.77307	2022-07-12 18:14:22.77307	5	t	10-cotton-90-elastan
190	Lose	8	7	2022-07-12 18:14:22.83099	2022-07-12 18:14:22.83099	6	t	lose
191	Men's	8	8	2022-07-12 18:14:22.889484	2022-07-12 18:14:22.889484	7	t	men-s
192	Shirts_checkedslimfitshirt_27.99	8	3	2022-07-12 18:14:22.948141	2022-07-12 18:14:22.948141	8	t	shirts_checkedslimfitshirt_27-99
193	Men	2	9	2022-07-12 18:14:23.007735	2022-07-12 18:14:23.007735	1	t	men
194	Men	2	10	2022-07-12 18:14:23.06329	2022-07-12 18:14:23.06329	2	t	men
195	Resiliance	2	1	2022-07-12 18:14:23.116924	2022-07-12 18:14:23.116924	3	t	resiliance
196	Theta	2	2	2022-07-12 18:14:23.171082	2022-07-12 18:14:23.171082	4	t	theta
197	10% Cotton 90% Elastan	2	6	2022-07-12 18:14:23.22397	2022-07-12 18:14:23.22397	5	t	10-cotton-90-elastan
198	Form	2	7	2022-07-12 18:14:23.277512	2022-07-12 18:14:23.277512	6	t	form
199	Men's	2	8	2022-07-12 18:14:23.333882	2022-07-12 18:14:23.333882	7	t	men-s
200	Shirts_checkedshirt_65.99	2	3	2022-07-12 18:14:23.388404	2022-07-12 18:14:23.388404	8	t	shirts_checkedshirt_65-99
201	Men	9	9	2022-07-12 18:14:23.443282	2022-07-12 18:14:23.443282	1	t	men
202	Men	9	10	2022-07-12 18:14:23.497539	2022-07-12 18:14:23.497539	2	t	men
203	Resiliance	9	1	2022-07-12 18:14:23.55002	2022-07-12 18:14:23.55002	3	t	resiliance
204	Epsilon	9	2	2022-07-12 18:14:23.601055	2022-07-12 18:14:23.601055	4	t	epsilon
205	50% Cotton 50% Elastan	9	6	2022-07-12 18:14:23.655893	2022-07-12 18:14:23.655893	5	t	50-cotton-50-elastan
206	Lose	9	7	2022-07-12 18:14:23.711173	2022-07-12 18:14:23.711173	6	t	lose
207	Men's	9	8	2022-07-12 18:14:23.770595	2022-07-12 18:14:23.770595	7	t	men-s
208	Shirts_dottedshirt_33.99	9	3	2022-07-12 18:14:23.828364	2022-07-12 18:14:23.828364	8	t	shirts_dottedshirt_33-99
209	Men	12	9	2022-07-12 18:14:23.889134	2022-07-12 18:14:23.889134	9	t	men
210	Men	12	10	2022-07-12 18:14:23.945017	2022-07-12 18:14:23.945017	10	t	men
211	Men	1	9	2022-07-12 18:14:24.289701	2022-07-12 18:14:24.289701	1	t	men
212	Men	1	10	2022-07-12 18:14:24.34823	2022-07-12 18:14:24.34823	2	t	men
213	Jerseys	1	1	2022-07-12 18:14:24.402796	2022-07-12 18:14:24.402796	3	t	jerseys
214	Beta	1	2	2022-07-12 18:14:24.458453	2022-07-12 18:14:24.458453	4	t	beta
215	50% Cotton 50% Elastan	1	6	2022-07-12 18:14:24.51555	2022-07-12 18:14:24.51555	5	t	50-cotton-50-elastan
216	Lose	1	7	2022-07-12 18:14:24.57213	2022-07-12 18:14:24.57213	6	t	lose
217	Men's	1	8	2022-07-12 18:14:24.63121	2022-07-12 18:14:24.63121	7	t	men-s
218	Shirts_denimshirt_24.99	1	3	2022-07-12 18:14:24.689938	2022-07-12 18:14:24.689938	8	t	shirts_denimshirt_24-99
219	Men	3	9	2022-07-12 18:14:24.747266	2022-07-12 18:14:24.747266	1	t	men
220	Men	3	10	2022-07-12 18:14:24.80962	2022-07-12 18:14:24.80962	2	t	men
221	Conditioned	3	1	2022-07-12 18:14:24.878811	2022-07-12 18:14:24.878811	3	t	conditioned
222	Zeta	3	2	2022-07-12 18:14:24.951182	2022-07-12 18:14:24.951182	4	t	zeta
223	90% Cotton 10% Elastan	3	6	2022-07-12 18:14:25.022085	2022-07-12 18:14:25.022085	5	t	90-cotton-10-elastan
224	Lose	3	7	2022-07-12 18:14:25.083546	2022-07-12 18:14:25.083546	6	t	lose
225	Men's	3	8	2022-07-12 18:14:25.143561	2022-07-12 18:14:25.143561	7	t	men-s
226	Shirts_coveredplacketshirt_99.99	3	3	2022-07-12 18:14:25.20584	2022-07-12 18:14:25.20584	8	t	shirts_coveredplacketshirt_99-99
227	Men	21	9	2022-07-12 18:14:25.272349	2022-07-12 18:14:25.272349	1	t	men
228	Men	21	10	2022-07-12 18:14:25.329825	2022-07-12 18:14:25.329825	2	t	men
229	Resiliance	21	1	2022-07-12 18:14:25.38203	2022-07-12 18:14:25.38203	3	t	resiliance
230	Theta	21	2	2022-07-12 18:14:25.432656	2022-07-12 18:14:25.432656	4	t	theta
231	50% Cotton 50% Elastan	21	6	2022-07-12 18:14:25.481892	2022-07-12 18:14:25.481892	5	t	50-cotton-50-elastan
232	Lose	21	7	2022-07-12 18:14:25.535101	2022-07-12 18:14:25.535101	6	t	lose
233	Men's	21	8	2022-07-12 18:14:25.589177	2022-07-12 18:14:25.589177	7	t	men-s
234	Sweaters_strippedjumper_88.99	21	3	2022-07-12 18:14:25.653489	2022-07-12 18:14:25.653489	8	t	sweaters_strippedjumper_88-99
235	Men	23	9	2022-07-12 18:14:25.714417	2022-07-12 18:14:25.714417	1	t	men
236	Men	23	10	2022-07-12 18:14:25.767154	2022-07-12 18:14:25.767154	2	t	men
237	Resiliance	23	1	2022-07-12 18:14:25.818697	2022-07-12 18:14:25.818697	3	t	resiliance
238	Beta	23	2	2022-07-12 18:14:25.871642	2022-07-12 18:14:25.871642	4	t	beta
239	90% Cotton 10% Elastan	23	6	2022-07-12 18:14:25.924963	2022-07-12 18:14:25.924963	5	t	90-cotton-10-elastan
240	Form	23	7	2022-07-12 18:14:25.976283	2022-07-12 18:14:25.976283	6	t	form
241	Men's	23	8	2022-07-12 18:14:26.030804	2022-07-12 18:14:26.030804	7	t	men-s
242	Sweaters_jumper_61.99	23	3	2022-07-12 18:14:26.085716	2022-07-12 18:14:26.085716	8	t	sweaters_jumper_61-99
243	Men	24	9	2022-07-12 18:14:26.141819	2022-07-12 18:14:26.141819	1	t	men
244	Men	24	10	2022-07-12 18:14:26.195364	2022-07-12 18:14:26.195364	2	t	men
245	Wannabe	24	1	2022-07-12 18:14:26.246861	2022-07-12 18:14:26.246861	3	t	wannabe
246	Gamma	24	2	2022-07-12 18:14:26.29732	2022-07-12 18:14:26.29732	4	t	gamma
247	90% Cotton 10% Elastan	24	6	2022-07-12 18:14:26.350889	2022-07-12 18:14:26.350889	5	t	90-cotton-10-elastan
248	Lose	24	7	2022-07-12 18:14:26.40023	2022-07-12 18:14:26.40023	6	t	lose
249	Men's	24	8	2022-07-12 18:14:26.451588	2022-07-12 18:14:26.451588	7	t	men-s
250	Sweaters_longsleevesweatshirt_73.99	24	3	2022-07-12 18:14:26.503217	2022-07-12 18:14:26.503217	8	t	sweaters_longsleevesweatshirt_73-99
251	Women	41	9	2022-07-12 18:14:26.556989	2022-07-12 18:14:26.556989	1	t	women
252	Women	41	10	2022-07-12 18:14:26.609006	2022-07-12 18:14:26.609006	2	t	women
253	Resiliance	41	1	2022-07-12 18:14:26.663716	2022-07-12 18:14:26.663716	3	t	resiliance
254	Gamma	41	2	2022-07-12 18:14:26.72211	2022-07-12 18:14:26.72211	4	t	gamma
255	90% Cotton 10% Elastan	41	6	2022-07-12 18:14:26.776732	2022-07-12 18:14:26.776732	5	t	90-cotton-10-elastan
256	Form	41	7	2022-07-12 18:14:26.828113	2022-07-12 18:14:26.828113	6	t	form
257	Women's	41	8	2022-07-12 18:14:26.883823	2022-07-12 18:14:26.883823	7	t	women-s
258	Skirts_flaredskirt_74.99	41	3	2022-07-12 18:14:26.939373	2022-07-12 18:14:26.939373	8	t	skirts_flaredskirt_74-99
259	Men	35	9	2022-07-12 18:14:27.048469	2022-07-12 18:14:27.048469	1	t	men
260	Men	35	10	2022-07-12 18:14:27.119298	2022-07-12 18:14:27.119298	2	t	men
261	Resiliance	35	1	2022-07-12 18:14:27.202782	2022-07-12 18:14:27.202782	3	t	resiliance
262	Zeta	35	2	2022-07-12 18:14:27.310811	2022-07-12 18:14:27.310811	4	t	zeta
263	10% Cotton 90% Elastan	35	6	2022-07-12 18:14:27.385987	2022-07-12 18:14:27.385987	5	t	10-cotton-90-elastan
264	Form	35	7	2022-07-12 18:14:27.450826	2022-07-12 18:14:27.450826	6	t	form
265	Men's	35	8	2022-07-12 18:14:27.536919	2022-07-12 18:14:27.536919	7	t	men-s
266	JacketsandCoats_jacketwithliner_73.99	35	3	2022-07-12 18:14:27.599777	2022-07-12 18:14:27.599777	8	t	jacketsandcoats_jacketwithliner_73-99
267	Men	28	9	2022-07-12 18:14:27.654215	2022-07-12 18:14:27.654215	1	t	men
268	Men	28	10	2022-07-12 18:14:27.715899	2022-07-12 18:14:27.715899	2	t	men
269	Wannabe	28	1	2022-07-12 18:14:27.775476	2022-07-12 18:14:27.775476	3	t	wannabe
270	Alpha	28	2	2022-07-12 18:14:27.834949	2022-07-12 18:14:27.834949	4	t	alpha
271	50% Cotton 50% Elastan	28	6	2022-07-12 18:14:27.893734	2022-07-12 18:14:27.893734	5	t	50-cotton-50-elastan
272	Form	28	7	2022-07-12 18:14:27.957162	2022-07-12 18:14:27.957162	6	t	form
273	Men's	28	8	2022-07-12 18:14:28.020424	2022-07-12 18:14:28.020424	7	t	men-s
274	JacketsandCoats_suedebikerjacket_33.99	28	3	2022-07-12 18:14:28.083887	2022-07-12 18:14:28.083887	8	t	jacketsandcoats_suedebikerjacket_33-99
275	Men	25	9	2022-07-12 18:14:28.150023	2022-07-12 18:14:28.150023	1	t	men
276	Men	25	10	2022-07-12 18:14:28.204589	2022-07-12 18:14:28.204589	2	t	men
277	Wilson	25	1	2022-07-12 18:14:28.25782	2022-07-12 18:14:28.25782	3	t	wilson
278	Epsilon	25	2	2022-07-12 18:14:28.312726	2022-07-12 18:14:28.312726	4	t	epsilon
279	90% Cotton 10% Elastan	25	6	2022-07-12 18:14:28.367796	2022-07-12 18:14:28.367796	5	t	90-cotton-10-elastan
280	Form	25	7	2022-07-12 18:14:28.421897	2022-07-12 18:14:28.421897	6	t	form
281	Men's	25	8	2022-07-12 18:14:28.478209	2022-07-12 18:14:28.478209	7	t	men-s
282	Sweaters_hoodie_24.99	25	3	2022-07-12 18:14:28.534009	2022-07-12 18:14:28.534009	8	t	sweaters_hoodie_24-99
283	Men	33	9	2022-07-12 18:14:28.591417	2022-07-12 18:14:28.591417	1	t	men
284	Men	33	10	2022-07-12 18:14:28.644203	2022-07-12 18:14:28.644203	2	t	men
285	Wannabe	33	1	2022-07-12 18:14:28.698478	2022-07-12 18:14:28.698478	3	t	wannabe
286	Gamma	33	2	2022-07-12 18:14:28.752605	2022-07-12 18:14:28.752605	4	t	gamma
287	10% Cotton 90% Elastan	33	6	2022-07-12 18:14:28.807507	2022-07-12 18:14:28.807507	5	t	10-cotton-90-elastan
288	Form	33	7	2022-07-12 18:14:28.86033	2022-07-12 18:14:28.86033	6	t	form
289	Men's	33	8	2022-07-12 18:14:28.916019	2022-07-12 18:14:28.916019	7	t	men-s
290	JacketsandCoats_downjacketwithhood_64.99	33	3	2022-07-12 18:14:28.976371	2022-07-12 18:14:28.976371	8	t	jacketsandcoats_downjacketwithhood_64-99
291	Women	82	9	2022-07-12 18:14:29.029763	2022-07-12 18:14:29.029763	9	t	women
292	Women	82	10	2022-07-12 18:14:29.083997	2022-07-12 18:14:29.083997	10	t	women
113	Conditioned	82	1	2022-07-12 18:14:17.078167	2022-07-12 18:14:29.137212	1	t	conditioned
118	50% Cotton 50% Elastan	82	6	2022-07-12 18:14:17.383297	2022-07-12 18:14:29.245075	6	t	50-cotton-50-elastan
293	Men	29	9	2022-07-12 18:14:29.384071	2022-07-12 18:14:29.384071	1	t	men
294	Men	29	10	2022-07-12 18:14:29.43597	2022-07-12 18:14:29.43597	2	t	men
295	Conditioned	29	1	2022-07-12 18:14:29.489652	2022-07-12 18:14:29.489652	3	t	conditioned
296	Gamma	29	2	2022-07-12 18:14:29.546089	2022-07-12 18:14:29.546089	4	t	gamma
297	90% Cotton 10% Elastan	29	6	2022-07-12 18:14:29.597669	2022-07-12 18:14:29.597669	5	t	90-cotton-10-elastan
298	Form	29	7	2022-07-12 18:14:29.649927	2022-07-12 18:14:29.649927	6	t	form
299	Men's	29	8	2022-07-12 18:14:29.706852	2022-07-12 18:14:29.706852	7	t	men-s
300	JacketsandCoats_hoodedjacket_11.99	29	3	2022-07-12 18:14:29.792854	2022-07-12 18:14:29.792854	8	t	jacketsandcoats_hoodedjacket_11-99
301	Men	34	9	2022-07-12 18:14:29.850449	2022-07-12 18:14:29.850449	1	t	men
302	Men	34	10	2022-07-12 18:14:29.903939	2022-07-12 18:14:29.903939	2	t	men
303	Conditioned	34	1	2022-07-12 18:14:29.955505	2022-07-12 18:14:29.955505	3	t	conditioned
304	Delta	34	2	2022-07-12 18:14:30.006796	2022-07-12 18:14:30.006796	4	t	delta
305	90% Cotton 10% Elastan	34	6	2022-07-12 18:14:30.058906	2022-07-12 18:14:30.058906	5	t	90-cotton-10-elastan
306	Form	34	7	2022-07-12 18:14:30.107756	2022-07-12 18:14:30.107756	6	t	form
307	Men's	34	8	2022-07-12 18:14:30.159972	2022-07-12 18:14:30.159972	7	t	men-s
308	JacketsandCoats_wool-blendcoat_35.99	34	3	2022-07-12 18:14:30.213906	2022-07-12 18:14:30.213906	8	t	jacketsandcoats_wool-blendcoat_35-99
309	Women	36	9	2022-07-12 18:14:30.266913	2022-07-12 18:14:30.266913	1	t	women
310	Women	36	10	2022-07-12 18:14:30.317448	2022-07-12 18:14:30.317448	2	t	women
311	Conditioned	36	1	2022-07-12 18:14:30.365933	2022-07-12 18:14:30.365933	3	t	conditioned
312	Epsilon	36	2	2022-07-12 18:14:30.41469	2022-07-12 18:14:30.41469	4	t	epsilon
313	10% Cotton 90% Elastan	36	6	2022-07-12 18:14:30.471277	2022-07-12 18:14:30.471277	5	t	10-cotton-90-elastan
314	Form	36	7	2022-07-12 18:14:30.521656	2022-07-12 18:14:30.521656	6	t	form
315	Women's	36	8	2022-07-12 18:14:30.574984	2022-07-12 18:14:30.574984	7	t	women-s
316	Skirts_flaredmidiskirt_21.99	36	3	2022-07-12 18:14:30.635812	2022-07-12 18:14:30.635812	8	t	skirts_flaredmidiskirt_21-99
317	Women	37	9	2022-07-12 18:14:30.691403	2022-07-12 18:14:30.691403	1	t	women
318	Women	37	10	2022-07-12 18:14:30.748611	2022-07-12 18:14:30.748611	2	t	women
319	Wannabe	37	1	2022-07-12 18:14:30.801906	2022-07-12 18:14:30.801906	3	t	wannabe
320	Beta	37	2	2022-07-12 18:14:30.856686	2022-07-12 18:14:30.856686	4	t	beta
321	50% Cotton 50% Elastan	37	6	2022-07-12 18:14:30.920642	2022-07-12 18:14:30.920642	5	t	50-cotton-50-elastan
322	Lose	37	7	2022-07-12 18:14:30.975956	2022-07-12 18:14:30.975956	6	t	lose
323	Women's	37	8	2022-07-12 18:14:31.034065	2022-07-12 18:14:31.034065	7	t	women-s
324	Skirts_midiskirtwithbottoms_40.99	37	3	2022-07-12 18:14:31.092867	2022-07-12 18:14:31.092867	8	t	skirts_midiskirtwithbottoms_40-99
325	Men	31	9	2022-07-12 18:14:31.155959	2022-07-12 18:14:31.155959	1	t	men
326	Men	31	10	2022-07-12 18:14:31.216778	2022-07-12 18:14:31.216778	2	t	men
327	Wilson	31	1	2022-07-12 18:14:31.289109	2022-07-12 18:14:31.289109	3	t	wilson
328	Theta	31	2	2022-07-12 18:14:31.353207	2022-07-12 18:14:31.353207	4	t	theta
329	50% Cotton 50% Elastan	31	6	2022-07-12 18:14:31.411705	2022-07-12 18:14:31.411705	5	t	50-cotton-50-elastan
330	Lose	31	7	2022-07-12 18:14:31.465299	2022-07-12 18:14:31.465299	6	t	lose
331	Men's	31	8	2022-07-12 18:14:31.521792	2022-07-12 18:14:31.521792	7	t	men-s
332	JacketsandCoats_denimjacket_76.99	31	3	2022-07-12 18:14:31.576122	2022-07-12 18:14:31.576122	8	t	jacketsandcoats_denimjacket_76-99
333	Women	40	9	2022-07-12 18:14:31.632511	2022-07-12 18:14:31.632511	1	t	women
334	Women	40	10	2022-07-12 18:14:31.689644	2022-07-12 18:14:31.689644	2	t	women
335	Wilson	40	1	2022-07-12 18:14:31.746974	2022-07-12 18:14:31.746974	3	t	wilson
336	Alpha	40	2	2022-07-12 18:14:31.803779	2022-07-12 18:14:31.803779	4	t	alpha
337	50% Cotton 50% Elastan	40	6	2022-07-12 18:14:31.860866	2022-07-12 18:14:31.860866	5	t	50-cotton-50-elastan
338	Lose	40	7	2022-07-12 18:14:31.922653	2022-07-12 18:14:31.922653	6	t	lose
339	Women's	40	8	2022-07-12 18:14:31.993681	2022-07-12 18:14:31.993681	7	t	women-s
340	Skirts_leatherskirtwithlacing_46.99	40	3	2022-07-12 18:14:32.058135	2022-07-12 18:14:32.058135	8	t	skirts_leatherskirtwithlacing_46-99
341	Men	26	9	2022-07-12 18:14:32.130087	2022-07-12 18:14:32.130087	1	t	men
342	Men	26	10	2022-07-12 18:14:32.186619	2022-07-12 18:14:32.186619	2	t	men
343	Wilson	26	1	2022-07-12 18:14:32.239696	2022-07-12 18:14:32.239696	3	t	wilson
344	Zeta	26	2	2022-07-12 18:14:32.293217	2022-07-12 18:14:32.293217	4	t	zeta
345	50% Cotton 50% Elastan	26	6	2022-07-12 18:14:32.35274	2022-07-12 18:14:32.35274	5	t	50-cotton-50-elastan
346	Form	26	7	2022-07-12 18:14:32.407645	2022-07-12 18:14:32.407645	6	t	form
347	Men's	26	8	2022-07-12 18:14:32.465945	2022-07-12 18:14:32.465945	7	t	men-s
348	Sweaters_zippedhighnecksweater_67.99	26	3	2022-07-12 18:14:32.521904	2022-07-12 18:14:32.521904	8	t	sweaters_zippedhighnecksweater_67-99
349	Women	42	9	2022-07-12 18:14:32.575822	2022-07-12 18:14:32.575822	1	t	women
350	Women	42	10	2022-07-12 18:14:32.624261	2022-07-12 18:14:32.624261	2	t	women
351	Wannabe	42	1	2022-07-12 18:14:32.680971	2022-07-12 18:14:32.680971	3	t	wannabe
352	Epsilon	42	2	2022-07-12 18:14:32.729187	2022-07-12 18:14:32.729187	4	t	epsilon
353	90% Cotton 10% Elastan	42	6	2022-07-12 18:14:32.77709	2022-07-12 18:14:32.77709	5	t	90-cotton-10-elastan
354	Form	42	7	2022-07-12 18:14:32.828697	2022-07-12 18:14:32.828697	6	t	form
355	Women's	42	8	2022-07-12 18:14:32.876001	2022-07-12 18:14:32.876001	7	t	women-s
356	Skirts_skaterskirt_17.99	42	3	2022-07-12 18:14:32.924708	2022-07-12 18:14:32.924708	8	t	skirts_skaterskirt_17-99
357	Women	43	9	2022-07-12 18:14:33.023183	2022-07-12 18:14:33.023183	1	t	women
358	Women	43	10	2022-07-12 18:14:33.077826	2022-07-12 18:14:33.077826	2	t	women
359	Jerseys	43	1	2022-07-12 18:14:33.1266	2022-07-12 18:14:33.1266	3	t	jerseys
360	Zeta	43	2	2022-07-12 18:14:33.194966	2022-07-12 18:14:33.194966	4	t	zeta
361	10% Cotton 90% Elastan	43	6	2022-07-12 18:14:33.245304	2022-07-12 18:14:33.245304	5	t	10-cotton-90-elastan
362	Form	43	7	2022-07-12 18:14:33.296182	2022-07-12 18:14:33.296182	6	t	form
363	Women's	43	8	2022-07-12 18:14:33.348691	2022-07-12 18:14:33.348691	7	t	women-s
364	Skirts_skatershortskirt_67.99	43	3	2022-07-12 18:14:33.404597	2022-07-12 18:14:33.404597	8	t	skirts_skatershortskirt_67-99
365	Women	49	9	2022-07-12 18:14:33.458226	2022-07-12 18:14:33.458226	1	t	women
366	Women	49	10	2022-07-12 18:14:33.513114	2022-07-12 18:14:33.513114	2	t	women
367	Wilson	49	1	2022-07-12 18:14:33.568174	2022-07-12 18:14:33.568174	3	t	wilson
368	Zeta	49	2	2022-07-12 18:14:33.622214	2022-07-12 18:14:33.622214	4	t	zeta
369	10% Cotton 90% Elastan	49	6	2022-07-12 18:14:33.676972	2022-07-12 18:14:33.676972	5	t	10-cotton-90-elastan
370	Form	49	7	2022-07-12 18:14:33.732751	2022-07-12 18:14:33.732751	6	t	form
371	Women's	49	8	2022-07-12 18:14:33.790776	2022-07-12 18:14:33.790776	7	t	women-s
372	Dresses_elegantflareddress_55.99	49	3	2022-07-12 18:14:33.855078	2022-07-12 18:14:33.855078	8	t	dresses_elegantflareddress_55-99
373	Women	51	9	2022-07-12 18:14:33.935258	2022-07-12 18:14:33.935258	1	t	women
374	Women	51	10	2022-07-12 18:14:34.020249	2022-07-12 18:14:34.020249	2	t	women
375	Resiliance	51	1	2022-07-12 18:14:34.101267	2022-07-12 18:14:34.101267	3	t	resiliance
376	Zeta	51	2	2022-07-12 18:14:34.167834	2022-07-12 18:14:34.167834	4	t	zeta
377	10% Cotton 90% Elastan	51	6	2022-07-12 18:14:34.234122	2022-07-12 18:14:34.234122	5	t	10-cotton-90-elastan
378	Form	51	7	2022-07-12 18:14:34.289013	2022-07-12 18:14:34.289013	6	t	form
379	Women's	51	8	2022-07-12 18:14:34.346717	2022-07-12 18:14:34.346717	7	t	women-s
380	Dresses_stripedshirtdress_87.99	51	3	2022-07-12 18:14:34.408887	2022-07-12 18:14:34.408887	8	t	dresses_stripedshirtdress_87-99
381	Women	46	9	2022-07-12 18:14:34.470371	2022-07-12 18:14:34.470371	1	t	women
382	Women	46	10	2022-07-12 18:14:34.526141	2022-07-12 18:14:34.526141	2	t	women
383	Resiliance	46	1	2022-07-12 18:14:34.581724	2022-07-12 18:14:34.581724	3	t	resiliance
384	Beta	46	2	2022-07-12 18:14:34.634306	2022-07-12 18:14:34.634306	4	t	beta
385	10% Cotton 90% Elastan	46	6	2022-07-12 18:14:34.690771	2022-07-12 18:14:34.690771	5	t	10-cotton-90-elastan
386	Lose	46	7	2022-07-12 18:14:34.757123	2022-07-12 18:14:34.757123	6	t	lose
387	Women's	46	8	2022-07-12 18:14:34.814304	2022-07-12 18:14:34.814304	7	t	women-s
388	Dresses_floralwrapdress_14.99	46	3	2022-07-12 18:14:34.877994	2022-07-12 18:14:34.877994	8	t	dresses_floralwrapdress_14-99
389	Women	50	9	2022-07-12 18:14:34.945914	2022-07-12 18:14:34.945914	1	t	women
390	Women	50	10	2022-07-12 18:14:35.014742	2022-07-12 18:14:35.014742	2	t	women
391	Wannabe	50	1	2022-07-12 18:14:35.08501	2022-07-12 18:14:35.08501	3	t	wannabe
392	Alpha	50	2	2022-07-12 18:14:35.157972	2022-07-12 18:14:35.157972	4	t	alpha
393	90% Cotton 10% Elastan	50	6	2022-07-12 18:14:35.232421	2022-07-12 18:14:35.232421	5	t	90-cotton-10-elastan
394	Lose	50	7	2022-07-12 18:14:35.306874	2022-07-12 18:14:35.306874	6	t	lose
395	Women's	50	8	2022-07-12 18:14:35.402551	2022-07-12 18:14:35.402551	7	t	women-s
396	Dresses_longsleeveknitteddress_23.99	50	3	2022-07-12 18:14:35.497159	2022-07-12 18:14:35.497159	8	t	dresses_longsleeveknitteddress_23-99
397	Women	64	9	2022-07-12 18:14:35.569682	2022-07-12 18:14:35.569682	1	t	women
398	Women	64	10	2022-07-12 18:14:35.640158	2022-07-12 18:14:35.640158	2	t	women
399	Resiliance	64	1	2022-07-12 18:14:35.70729	2022-07-12 18:14:35.70729	3	t	resiliance
400	Epsilon	64	2	2022-07-12 18:14:35.770971	2022-07-12 18:14:35.770971	4	t	epsilon
401	90% Cotton 10% Elastan	64	6	2022-07-12 18:14:35.837058	2022-07-12 18:14:35.837058	5	t	90-cotton-10-elastan
402	Lose	64	7	2022-07-12 18:14:35.906272	2022-07-12 18:14:35.906272	6	t	lose
403	Women's	64	8	2022-07-12 18:14:35.975959	2022-07-12 18:14:35.975959	7	t	women-s
404	ShirtsandBlouses_blousewithwideflouncedsleeve_90.99	64	3	2022-07-12 18:14:36.05282	2022-07-12 18:14:36.05282	8	t	shirtsandblouses_blousewithwideflouncedsleeve_90-99
405	Women	53	9	2022-07-12 18:14:36.124452	2022-07-12 18:14:36.124452	1	t	women
406	Women	53	10	2022-07-12 18:14:36.186773	2022-07-12 18:14:36.186773	2	t	women
407	Jerseys	53	1	2022-07-12 18:14:36.245011	2022-07-12 18:14:36.245011	3	t	jerseys
408	Gamma	53	2	2022-07-12 18:14:36.304768	2022-07-12 18:14:36.304768	4	t	gamma
409	90% Cotton 10% Elastan	53	6	2022-07-12 18:14:36.361476	2022-07-12 18:14:36.361476	5	t	90-cotton-10-elastan
410	Form	53	7	2022-07-12 18:14:36.416845	2022-07-12 18:14:36.416845	6	t	form
411	Women's	53	8	2022-07-12 18:14:36.474958	2022-07-12 18:14:36.474958	7	t	women-s
412	Dresses_printedslit-sleevesdress_76.99	53	3	2022-07-12 18:14:36.533632	2022-07-12 18:14:36.533632	8	t	dresses_printedslit-sleevesdress_76-99
413	Women	44	9	2022-07-12 18:14:36.591963	2022-07-12 18:14:36.591963	1	t	women
414	Women	44	10	2022-07-12 18:14:36.654181	2022-07-12 18:14:36.654181	2	t	women
415	Wannabe	44	1	2022-07-12 18:14:36.712567	2022-07-12 18:14:36.712567	3	t	wannabe
416	Alpha	44	2	2022-07-12 18:14:36.772895	2022-07-12 18:14:36.772895	4	t	alpha
417	50% Cotton 50% Elastan	44	6	2022-07-12 18:14:36.831879	2022-07-12 18:14:36.831879	5	t	50-cotton-50-elastan
418	Form	44	7	2022-07-12 18:14:36.907068	2022-07-12 18:14:36.907068	6	t	form
419	Women's	44	8	2022-07-12 18:14:37.023805	2022-07-12 18:14:37.023805	7	t	women-s
420	Skirts_floralflaredskirt_10.99	44	3	2022-07-12 18:14:37.090086	2022-07-12 18:14:37.090086	8	t	skirts_floralflaredskirt_10-99
421	Women	59	9	2022-07-12 18:14:37.157205	2022-07-12 18:14:37.157205	1	t	women
422	Women	59	10	2022-07-12 18:14:37.217899	2022-07-12 18:14:37.217899	2	t	women
423	Wilson	59	1	2022-07-12 18:14:37.278511	2022-07-12 18:14:37.278511	3	t	wilson
424	Theta	59	2	2022-07-12 18:14:37.340021	2022-07-12 18:14:37.340021	4	t	theta
425	10% Cotton 90% Elastan	59	6	2022-07-12 18:14:37.400306	2022-07-12 18:14:37.400306	5	t	10-cotton-90-elastan
426	Form	59	7	2022-07-12 18:14:37.459075	2022-07-12 18:14:37.459075	6	t	form
427	Women's	59	8	2022-07-12 18:14:37.521723	2022-07-12 18:14:37.521723	7	t	women-s
428	ShirtsandBlouses_stripedshirt_60.99	59	3	2022-07-12 18:14:37.609497	2022-07-12 18:14:37.609497	8	t	shirtsandblouses_stripedshirt_60-99
429	Women	60	9	2022-07-12 18:14:37.673605	2022-07-12 18:14:37.673605	1	t	women
430	Women	60	10	2022-07-12 18:14:37.730002	2022-07-12 18:14:37.730002	2	t	women
431	Conditioned	60	1	2022-07-12 18:14:37.785902	2022-07-12 18:14:37.785902	3	t	conditioned
432	Gamma	60	2	2022-07-12 18:14:37.864997	2022-07-12 18:14:37.864997	4	t	gamma
433	90% Cotton 10% Elastan	60	6	2022-07-12 18:14:37.924748	2022-07-12 18:14:37.924748	5	t	90-cotton-10-elastan
434	Lose	60	7	2022-07-12 18:14:37.98011	2022-07-12 18:14:37.98011	6	t	lose
435	Women's	60	8	2022-07-12 18:14:38.041965	2022-07-12 18:14:38.041965	7	t	women-s
436	ShirtsandBlouses_v-neckwideshirt_68.99	60	3	2022-07-12 18:14:38.103378	2022-07-12 18:14:38.103378	8	t	shirtsandblouses_v-neckwideshirt_68-99
437	Women	57	9	2022-07-12 18:14:38.159178	2022-07-12 18:14:38.159178	1	t	women
438	Women	57	10	2022-07-12 18:14:38.218768	2022-07-12 18:14:38.218768	2	t	women
439	Wilson	57	1	2022-07-12 18:14:38.272753	2022-07-12 18:14:38.272753	3	t	wilson
440	Zeta	57	2	2022-07-12 18:14:38.328912	2022-07-12 18:14:38.328912	4	t	zeta
441	50% Cotton 50% Elastan	57	6	2022-07-12 18:14:38.404798	2022-07-12 18:14:38.404798	5	t	50-cotton-50-elastan
442	Form	57	7	2022-07-12 18:14:38.468543	2022-07-12 18:14:38.468543	6	t	form
443	Women's	57	8	2022-07-12 18:14:38.537956	2022-07-12 18:14:38.537956	7	t	women-s
444	Dresses_slitmaxidress_26.99	57	3	2022-07-12 18:14:38.603886	2022-07-12 18:14:38.603886	8	t	dresses_slitmaxidress_26-99
445	Women	63	9	2022-07-12 18:14:38.663534	2022-07-12 18:14:38.663534	1	t	women
446	Women	63	10	2022-07-12 18:14:38.717626	2022-07-12 18:14:38.717626	2	t	women
447	Conditioned	63	1	2022-07-12 18:14:38.774756	2022-07-12 18:14:38.774756	3	t	conditioned
448	Beta	63	2	2022-07-12 18:14:38.831605	2022-07-12 18:14:38.831605	4	t	beta
449	90% Cotton 10% Elastan	63	6	2022-07-12 18:14:38.894	2022-07-12 18:14:38.894	5	t	90-cotton-10-elastan
450	Lose	63	7	2022-07-12 18:14:38.960759	2022-07-12 18:14:38.960759	6	t	lose
451	Women's	63	8	2022-07-12 18:14:39.028544	2022-07-12 18:14:39.028544	7	t	women-s
452	ShirtsandBlouses_cottonshirt_17.99	63	3	2022-07-12 18:14:39.090872	2022-07-12 18:14:39.090872	8	t	shirtsandblouses_cottonshirt_17-99
453	Women	58	9	2022-07-12 18:14:39.152337	2022-07-12 18:14:39.152337	1	t	women
454	Women	58	10	2022-07-12 18:14:39.206226	2022-07-12 18:14:39.206226	2	t	women
455	Wannabe	58	1	2022-07-12 18:14:39.260759	2022-07-12 18:14:39.260759	3	t	wannabe
456	Gamma	58	2	2022-07-12 18:14:39.319061	2022-07-12 18:14:39.319061	4	t	gamma
457	10% Cotton 90% Elastan	58	6	2022-07-12 18:14:39.372198	2022-07-12 18:14:39.372198	5	t	10-cotton-90-elastan
458	Form	58	7	2022-07-12 18:14:39.423571	2022-07-12 18:14:39.423571	6	t	form
459	Women's	58	8	2022-07-12 18:14:39.474556	2022-07-12 18:14:39.474556	7	t	women-s
460	ShirtsandBlouses_semi-sheershirtwithfloralcuffs_91.99	58	3	2022-07-12 18:14:39.527881	2022-07-12 18:14:39.527881	8	t	shirtsandblouses_semi-sheershirtwithfloralcuffs_91-99
461	Women	52	9	2022-07-12 18:14:39.582931	2022-07-12 18:14:39.582931	1	t	women
462	Women	52	10	2022-07-12 18:14:39.640262	2022-07-12 18:14:39.640262	2	t	women
463	Jerseys	52	1	2022-07-12 18:14:39.698816	2022-07-12 18:14:39.698816	3	t	jerseys
464	Epsilon	52	2	2022-07-12 18:14:39.754005	2022-07-12 18:14:39.754005	4	t	epsilon
465	50% Cotton 50% Elastan	52	6	2022-07-12 18:14:39.809327	2022-07-12 18:14:39.809327	5	t	50-cotton-50-elastan
466	Lose	52	7	2022-07-12 18:14:39.860985	2022-07-12 18:14:39.860985	6	t	lose
467	Women's	52	8	2022-07-12 18:14:39.916737	2022-07-12 18:14:39.916737	7	t	women-s
468	Dresses_printeddress_83.99	52	3	2022-07-12 18:14:39.971305	2022-07-12 18:14:39.971305	8	t	dresses_printeddress_83-99
469	Women	56	9	2022-07-12 18:14:40.026037	2022-07-12 18:14:40.026037	1	t	women
470	Women	56	10	2022-07-12 18:14:40.079035	2022-07-12 18:14:40.079035	2	t	women
471	Jerseys	56	1	2022-07-12 18:14:40.131795	2022-07-12 18:14:40.131795	3	t	jerseys
472	Delta	56	2	2022-07-12 18:14:40.185447	2022-07-12 18:14:40.185447	4	t	delta
473	90% Cotton 10% Elastan	56	6	2022-07-12 18:14:40.235507	2022-07-12 18:14:40.235507	5	t	90-cotton-10-elastan
474	Lose	56	7	2022-07-12 18:14:40.286719	2022-07-12 18:14:40.286719	6	t	lose
475	Women's	56	8	2022-07-12 18:14:40.34412	2022-07-12 18:14:40.34412	7	t	women-s
476	Dresses_flounceddress_32.99	56	3	2022-07-12 18:14:40.399277	2022-07-12 18:14:40.399277	8	t	dresses_flounceddress_32-99
477	Women	61	9	2022-07-12 18:14:40.453047	2022-07-12 18:14:40.453047	1	t	women
478	Women	61	10	2022-07-12 18:14:40.506142	2022-07-12 18:14:40.506142	2	t	women
479	Resiliance	61	1	2022-07-12 18:14:40.562511	2022-07-12 18:14:40.562511	3	t	resiliance
480	Gamma	61	2	2022-07-12 18:14:40.615365	2022-07-12 18:14:40.615365	4	t	gamma
481	50% Cotton 50% Elastan	61	6	2022-07-12 18:14:40.67027	2022-07-12 18:14:40.67027	5	t	50-cotton-50-elastan
482	Form	61	7	2022-07-12 18:14:40.721831	2022-07-12 18:14:40.721831	6	t	form
483	Women's	61	8	2022-07-12 18:14:40.781053	2022-07-12 18:14:40.781053	7	t	women-s
484	ShirtsandBlouses_printedwrappedblouse_15.99	61	3	2022-07-12 18:14:40.837995	2022-07-12 18:14:40.837995	8	t	shirtsandblouses_printedwrappedblouse_15-99
485	Women	62	9	2022-07-12 18:14:40.891787	2022-07-12 18:14:40.891787	1	t	women
486	Women	62	10	2022-07-12 18:14:40.945351	2022-07-12 18:14:40.945351	2	t	women
487	Conditioned	62	1	2022-07-12 18:14:40.997142	2022-07-12 18:14:40.997142	3	t	conditioned
488	Delta	62	2	2022-07-12 18:14:41.074211	2022-07-12 18:14:41.074211	4	t	delta
489	90% Cotton 10% Elastan	62	6	2022-07-12 18:14:41.128436	2022-07-12 18:14:41.128436	5	t	90-cotton-10-elastan
490	Lose	62	7	2022-07-12 18:14:41.181156	2022-07-12 18:14:41.181156	6	t	lose
491	Women's	62	8	2022-07-12 18:14:41.237776	2022-07-12 18:14:41.237776	7	t	women-s
492	ShirtsandBlouses_pleatedsleevev-neckshirt_28.99	62	3	2022-07-12 18:14:41.294736	2022-07-12 18:14:41.294736	8	t	shirtsandblouses_pleatedsleevev-neckshirt_28-99
493	Women	84	9	2022-07-12 18:14:41.350608	2022-07-12 18:14:41.350608	9	t	women
494	Women	84	10	2022-07-12 18:14:41.407653	2022-07-12 18:14:41.407653	10	t	women
134	50% Cotton 50% Elastan	84	6	2022-07-12 18:14:18.509334	2022-07-12 18:14:41.560489	6	t	50-cotton-50-elastan
495	Women	67	9	2022-07-12 18:14:41.738918	2022-07-12 18:14:41.738918	1	t	women
496	Women	67	10	2022-07-12 18:14:41.795211	2022-07-12 18:14:41.795211	2	t	women
497	Conditioned	67	1	2022-07-12 18:14:41.853023	2022-07-12 18:14:41.853023	3	t	conditioned
498	Beta	67	2	2022-07-12 18:14:41.912019	2022-07-12 18:14:41.912019	4	t	beta
499	50% Cotton 50% Elastan	67	6	2022-07-12 18:14:41.966848	2022-07-12 18:14:41.966848	5	t	50-cotton-50-elastan
500	Lose	67	7	2022-07-12 18:14:42.026001	2022-07-12 18:14:42.026001	6	t	lose
501	Women's	67	8	2022-07-12 18:14:42.082184	2022-07-12 18:14:42.082184	7	t	women-s
502	ShirtsandBlouses_semi-sheershirtwithpockets_36.99	67	3	2022-07-12 18:14:42.140443	2022-07-12 18:14:42.140443	8	t	shirtsandblouses_semi-sheershirtwithpockets_36-99
503	Women	68	9	2022-07-12 18:14:42.20094	2022-07-12 18:14:42.20094	1	t	women
504	Women	68	10	2022-07-12 18:14:42.25867	2022-07-12 18:14:42.25867	2	t	women
505	Wannabe	68	1	2022-07-12 18:14:42.311857	2022-07-12 18:14:42.311857	3	t	wannabe
506	Theta	68	2	2022-07-12 18:14:42.366943	2022-07-12 18:14:42.366943	4	t	theta
507	50% Cotton 50% Elastan	68	6	2022-07-12 18:14:42.422512	2022-07-12 18:14:42.422512	5	t	50-cotton-50-elastan
508	Form	68	7	2022-07-12 18:14:42.475241	2022-07-12 18:14:42.475241	6	t	form
509	Women's	68	8	2022-07-12 18:14:42.53086	2022-07-12 18:14:42.53086	7	t	women-s
510	ShirtsandBlouses_v-neckshirt_87.99	68	3	2022-07-12 18:14:42.590445	2022-07-12 18:14:42.590445	8	t	shirtsandblouses_v-neckshirt_87-99
511	Women	83	9	2022-07-12 18:14:42.649302	2022-07-12 18:14:42.649302	9	t	women
512	Women	83	10	2022-07-12 18:14:42.706367	2022-07-12 18:14:42.706367	10	t	women
123	TopsandT-shirts_sleevelessloosetop_58.99	83	3	2022-07-12 18:14:17.738736	2022-07-12 18:14:43.016119	3	t	topsandt-shirts_sleevelessloosetop_58-99
513	Women	78	9	2022-07-12 18:14:43.068358	2022-07-12 18:14:43.068358	9	t	women
514	Women	78	10	2022-07-12 18:14:43.120147	2022-07-12 18:14:43.120147	10	t	women
83	TopsandT-shirts_scrappytop_40.99	78	3	2022-07-12 18:14:15.457356	2022-07-12 18:14:43.357368	3	t	topsandt-shirts_scrappytop_40-99
515	Women	81	9	2022-07-12 18:14:43.410529	2022-07-12 18:14:43.410529	9	t	women
516	Women	81	10	2022-07-12 18:14:43.467502	2022-07-12 18:14:43.467502	10	t	women
517	Women	77	9	2022-07-12 18:14:43.798371	2022-07-12 18:14:43.798371	9	t	women
518	Women	77	10	2022-07-12 18:14:43.852488	2022-07-12 18:14:43.852488	10	t	women
519	Women	85	9	2022-07-12 18:14:44.231367	2022-07-12 18:14:44.231367	1	t	women
520	Women	85	10	2022-07-12 18:14:44.325974	2022-07-12 18:14:44.325974	2	t	women
521	Wannabe	85	1	2022-07-12 18:14:44.397838	2022-07-12 18:14:44.397838	3	t	wannabe
522	Delta	85	2	2022-07-12 18:14:44.582165	2022-07-12 18:14:44.582165	4	t	delta
523	50% Cotton 50% Elastan	85	6	2022-07-12 18:14:44.658557	2022-07-12 18:14:44.658557	5	t	50-cotton-50-elastan
524	Form	85	7	2022-07-12 18:14:44.72444	2022-07-12 18:14:44.72444	6	t	form
525	Women's	85	8	2022-07-12 18:14:44.792275	2022-07-12 18:14:44.792275	7	t	women-s
526	JacketsandCoats_coatwithpockets_27.99	85	3	2022-07-12 18:14:44.861929	2022-07-12 18:14:44.861929	8	t	jacketsandcoats_coatwithpockets_27-99
527	Women	73	9	2022-07-12 18:14:44.922111	2022-07-12 18:14:44.922111	1	t	women
528	Women	73	10	2022-07-12 18:14:44.977181	2022-07-12 18:14:44.977181	2	t	women
529	Wannabe	73	1	2022-07-12 18:14:45.028388	2022-07-12 18:14:45.028388	3	t	wannabe
530	Zeta	73	2	2022-07-12 18:14:45.0792	2022-07-12 18:14:45.0792	4	t	zeta
531	10% Cotton 90% Elastan	73	6	2022-07-12 18:14:45.133416	2022-07-12 18:14:45.133416	5	t	10-cotton-90-elastan
532	Form	73	7	2022-07-12 18:14:45.185824	2022-07-12 18:14:45.185824	6	t	form
533	Women's	73	8	2022-07-12 18:14:45.247766	2022-07-12 18:14:45.247766	7	t	women-s
534	Sweaters_knittedhighnecksweater_86.99	73	3	2022-07-12 18:14:45.300746	2022-07-12 18:14:45.300746	8	t	sweaters_knittedhighnecksweater_86-99
535	Women	76	9	2022-07-12 18:14:45.355888	2022-07-12 18:14:45.355888	9	t	women
536	Women	76	10	2022-07-12 18:14:45.409505	2022-07-12 18:14:45.409505	10	t	women
67	TopsandT-shirts_croptopwithtie_96.99	76	3	2022-07-12 18:14:14.691763	2022-07-12 18:14:45.626109	3	t	topsandt-shirts_croptopwithtie_96-99
537	Women	66	9	2022-07-12 18:14:45.673533	2022-07-12 18:14:45.673533	1	t	women
538	Women	66	10	2022-07-12 18:14:45.730026	2022-07-12 18:14:45.730026	2	t	women
539	Wannabe	66	1	2022-07-12 18:14:45.78154	2022-07-12 18:14:45.78154	3	t	wannabe
540	Beta	66	2	2022-07-12 18:14:45.836731	2022-07-12 18:14:45.836731	4	t	beta
541	50% Cotton 50% Elastan	66	6	2022-07-12 18:14:45.892647	2022-07-12 18:14:45.892647	5	t	50-cotton-50-elastan
542	Form	66	7	2022-07-12 18:14:45.947837	2022-07-12 18:14:45.947837	6	t	form
543	Women's	66	8	2022-07-12 18:14:46.004686	2022-07-12 18:14:46.004686	7	t	women-s
544	ShirtsandBlouses_floralshirt_72.99	66	3	2022-07-12 18:14:46.063878	2022-07-12 18:14:46.063878	8	t	shirtsandblouses_floralshirt_72-99
545	Women	75	9	2022-07-12 18:14:46.122782	2022-07-12 18:14:46.122782	1	t	women
546	Women	75	10	2022-07-12 18:14:46.179094	2022-07-12 18:14:46.179094	2	t	women
547	Conditioned	75	1	2022-07-12 18:14:46.22977	2022-07-12 18:14:46.22977	3	t	conditioned
548	Gamma	75	2	2022-07-12 18:14:46.28596	2022-07-12 18:14:46.28596	4	t	gamma
549	10% Cotton 90% Elastan	75	6	2022-07-12 18:14:46.338134	2022-07-12 18:14:46.338134	5	t	10-cotton-90-elastan
550	Lose	75	7	2022-07-12 18:14:46.390908	2022-07-12 18:14:46.390908	6	t	lose
551	Women's	75	8	2022-07-12 18:14:46.451694	2022-07-12 18:14:46.451694	7	t	women-s
552	Sweaters_croppedfittedsweater_92.99	75	3	2022-07-12 18:14:46.517685	2022-07-12 18:14:46.517685	8	t	sweaters_croppedfittedsweater_92-99
553	Women	72	9	2022-07-12 18:14:46.57501	2022-07-12 18:14:46.57501	1	t	women
554	Women	72	10	2022-07-12 18:14:46.630852	2022-07-12 18:14:46.630852	2	t	women
555	Conditioned	72	1	2022-07-12 18:14:46.683337	2022-07-12 18:14:46.683337	3	t	conditioned
556	Gamma	72	2	2022-07-12 18:14:46.739087	2022-07-12 18:14:46.739087	4	t	gamma
557	10% Cotton 90% Elastan	72	6	2022-07-12 18:14:46.794258	2022-07-12 18:14:46.794258	5	t	10-cotton-90-elastan
558	Form	72	7	2022-07-12 18:14:46.848524	2022-07-12 18:14:46.848524	6	t	form
559	Women's	72	8	2022-07-12 18:14:46.909507	2022-07-12 18:14:46.909507	7	t	women-s
560	Sweaters_oversizedsweatshirt_86.99	72	3	2022-07-12 18:14:46.966176	2022-07-12 18:14:46.966176	8	t	sweaters_oversizedsweatshirt_86-99
561	Women	71	9	2022-07-12 18:14:47.023071	2022-07-12 18:14:47.023071	1	t	women
562	Women	71	10	2022-07-12 18:14:47.097367	2022-07-12 18:14:47.097367	2	t	women
563	Wannabe	71	1	2022-07-12 18:14:47.183596	2022-07-12 18:14:47.183596	3	t	wannabe
564	Zeta	71	2	2022-07-12 18:14:47.252723	2022-07-12 18:14:47.252723	4	t	zeta
565	50% Cotton 50% Elastan	71	6	2022-07-12 18:14:47.329449	2022-07-12 18:14:47.329449	5	t	50-cotton-50-elastan
566	Lose	71	7	2022-07-12 18:14:47.385385	2022-07-12 18:14:47.385385	6	t	lose
567	Women's	71	8	2022-07-12 18:14:47.444373	2022-07-12 18:14:47.444373	7	t	women-s
568	Sweaters_oversizedknittedsweater_24.99	71	3	2022-07-12 18:14:47.502429	2022-07-12 18:14:47.502429	8	t	sweaters_oversizedknittedsweater_24-99
569	Women	91	9	2022-07-12 18:14:47.560313	2022-07-12 18:14:47.560313	1	t	women
570	Women	91	10	2022-07-12 18:14:47.615477	2022-07-12 18:14:47.615477	2	t	women
571	Wilson	91	1	2022-07-12 18:14:47.667776	2022-07-12 18:14:47.667776	3	t	wilson
572	Zeta	91	2	2022-07-12 18:14:47.722242	2022-07-12 18:14:47.722242	4	t	zeta
573	50% Cotton 50% Elastan	91	6	2022-07-12 18:14:47.77629	2022-07-12 18:14:47.77629	5	t	50-cotton-50-elastan
574	Lose	91	7	2022-07-12 18:14:47.828433	2022-07-12 18:14:47.828433	6	t	lose
575	Women's	91	8	2022-07-12 18:14:47.886573	2022-07-12 18:14:47.886573	7	t	women-s
576	JacketsandCoats_loose-fittedjacket_43.99	91	3	2022-07-12 18:14:47.969496	2022-07-12 18:14:47.969496	8	t	jacketsandcoats_loose-fittedjacket_43-99
577	Women	95	9	2022-07-12 18:14:48.027167	2022-07-12 18:14:48.027167	1	t	women
578	Women	95	10	2022-07-12 18:14:48.077301	2022-07-12 18:14:48.077301	2	t	women
579	Wilson	95	1	2022-07-12 18:14:48.126158	2022-07-12 18:14:48.126158	3	t	wilson
580	Gamma	95	2	2022-07-12 18:14:48.17478	2022-07-12 18:14:48.17478	4	t	gamma
581	10% Cotton 90% Elastan	95	6	2022-07-12 18:14:48.224924	2022-07-12 18:14:48.224924	5	t	10-cotton-90-elastan
582	Lose	95	7	2022-07-12 18:14:48.276582	2022-07-12 18:14:48.276582	6	t	lose
583	Women's	95	8	2022-07-12 18:14:48.327202	2022-07-12 18:14:48.327202	7	t	women-s
584	JacketsandCoats_denimhoodedjacket_88.99	95	3	2022-07-12 18:14:48.382198	2022-07-12 18:14:48.382198	8	t	jacketsandcoats_denimhoodedjacket_88-99
585	Sportswear	102	9	2022-07-12 18:14:48.439559	2022-07-12 18:14:48.439559	1	t	sportswear
586	Sportswear	102	10	2022-07-12 18:14:48.497461	2022-07-12 18:14:48.497461	2	t	sportswear
587	Wannabe	102	1	2022-07-12 18:14:48.5527	2022-07-12 18:14:48.5527	3	t	wannabe
588	Theta	102	2	2022-07-12 18:14:48.608435	2022-07-12 18:14:48.608435	4	t	theta
589	90% Cotton 10% Elastan	102	6	2022-07-12 18:14:48.661892	2022-07-12 18:14:48.661892	5	t	90-cotton-10-elastan
590	Form	102	7	2022-07-12 18:14:48.73169	2022-07-12 18:14:48.73169	6	t	form
591	Women's	102	8	2022-07-12 18:14:48.787606	2022-07-12 18:14:48.787606	7	t	women-s
592	Tops_sportsbramediumsupport_29.99	102	3	2022-07-12 18:14:48.847465	2022-07-12 18:14:48.847465	8	t	tops_sportsbramediumsupport_29-99
593	Women	87	9	2022-07-12 18:14:48.91092	2022-07-12 18:14:48.91092	1	t	women
594	Women	87	10	2022-07-12 18:14:48.969496	2022-07-12 18:14:48.969496	2	t	women
595	Wannabe	87	1	2022-07-12 18:14:49.023676	2022-07-12 18:14:49.023676	3	t	wannabe
596	Theta	87	2	2022-07-12 18:14:49.077276	2022-07-12 18:14:49.077276	4	t	theta
597	50% Cotton 50% Elastan	87	6	2022-07-12 18:14:49.13129	2022-07-12 18:14:49.13129	5	t	50-cotton-50-elastan
598	Form	87	7	2022-07-12 18:14:49.185466	2022-07-12 18:14:49.185466	6	t	form
599	Women's	87	8	2022-07-12 18:14:49.245203	2022-07-12 18:14:49.245203	7	t	women-s
600	JacketsandCoats_asymmetriccoat_19.99	87	3	2022-07-12 18:14:49.305691	2022-07-12 18:14:49.305691	8	t	jacketsandcoats_asymmetriccoat_19-99
601	Sportswear	106	9	2022-07-12 18:14:49.364407	2022-07-12 18:14:49.364407	1	t	sportswear
602	Sportswear	106	10	2022-07-12 18:14:49.423077	2022-07-12 18:14:49.423077	2	t	sportswear
603	Conditioned	106	1	2022-07-12 18:14:49.479508	2022-07-12 18:14:49.479508	3	t	conditioned
604	Alpha	106	2	2022-07-12 18:14:49.534933	2022-07-12 18:14:49.534933	4	t	alpha
605	90% Cotton 10% Elastan	106	6	2022-07-12 18:14:49.588438	2022-07-12 18:14:49.588438	5	t	90-cotton-10-elastan
606	Lose	106	7	2022-07-12 18:14:49.642997	2022-07-12 18:14:49.642997	6	t	lose
607	Women's	106	8	2022-07-12 18:14:49.700642	2022-07-12 18:14:49.700642	7	t	women-s
608	Sweatshirts_lightweightrunningjacket_52.99	106	3	2022-07-12 18:14:49.756775	2022-07-12 18:14:49.756775	8	t	sweatshirts_lightweightrunningjacket_52-99
609	Sportswear	101	9	2022-07-12 18:14:49.816576	2022-07-12 18:14:49.816576	1	t	sportswear
610	Sportswear	101	10	2022-07-12 18:14:49.874447	2022-07-12 18:14:49.874447	2	t	sportswear
611	Wannabe	101	1	2022-07-12 18:14:49.930472	2022-07-12 18:14:49.930472	3	t	wannabe
612	Alpha	101	2	2022-07-12 18:14:49.98972	2022-07-12 18:14:49.98972	4	t	alpha
613	50% Cotton 50% Elastan	101	6	2022-07-12 18:14:50.039643	2022-07-12 18:14:50.039643	5	t	50-cotton-50-elastan
614	Form	101	7	2022-07-12 18:14:50.089494	2022-07-12 18:14:50.089494	6	t	form
615	Women's	101	8	2022-07-12 18:14:50.146173	2022-07-12 18:14:50.146173	7	t	women-s
616	Tops_lacedcroptop_11.99	101	3	2022-07-12 18:14:50.20168	2022-07-12 18:14:50.20168	8	t	tops_lacedcroptop_11-99
617	Sportswear	104	9	2022-07-12 18:14:50.255083	2022-07-12 18:14:50.255083	1	t	sportswear
618	Sportswear	104	10	2022-07-12 18:14:50.310779	2022-07-12 18:14:50.310779	2	t	sportswear
619	Resiliance	104	1	2022-07-12 18:14:50.360488	2022-07-12 18:14:50.360488	3	t	resiliance
620	Delta	104	2	2022-07-12 18:14:50.411171	2022-07-12 18:14:50.411171	4	t	delta
621	10% Cotton 90% Elastan	104	6	2022-07-12 18:14:50.465516	2022-07-12 18:14:50.465516	5	t	10-cotton-90-elastan
622	Form	104	7	2022-07-12 18:14:50.516047	2022-07-12 18:14:50.516047	6	t	form
623	Women's	104	8	2022-07-12 18:14:50.568391	2022-07-12 18:14:50.568391	7	t	women-s
624	Tops_sportcropptop_47.99	104	3	2022-07-12 18:14:50.621975	2022-07-12 18:14:50.621975	8	t	tops_sportcropptop_47-99
625	Women	96	9	2022-07-12 18:14:50.676615	2022-07-12 18:14:50.676615	1	t	women
626	Women	96	10	2022-07-12 18:14:50.729953	2022-07-12 18:14:50.729953	2	t	women
627	Jerseys	96	1	2022-07-12 18:14:50.780111	2022-07-12 18:14:50.780111	3	t	jerseys
628	Delta	96	2	2022-07-12 18:14:50.832945	2022-07-12 18:14:50.832945	4	t	delta
629	50% Cotton 50% Elastan	96	6	2022-07-12 18:14:50.882034	2022-07-12 18:14:50.882034	5	t	50-cotton-50-elastan
630	Lose	96	7	2022-07-12 18:14:50.935942	2022-07-12 18:14:50.935942	6	t	lose
631	Women's	96	8	2022-07-12 18:14:50.986976	2022-07-12 18:14:50.986976	7	t	women-s
632	JacketsandCoats_bomberjacket_30.99	96	3	2022-07-12 18:14:51.037553	2022-07-12 18:14:51.037553	8	t	jacketsandcoats_bomberjacket_30-99
633	Women	93	9	2022-07-12 18:14:51.090701	2022-07-12 18:14:51.090701	1	t	women
634	Women	93	10	2022-07-12 18:14:51.169311	2022-07-12 18:14:51.169311	2	t	women
635	Jerseys	93	1	2022-07-12 18:14:51.257683	2022-07-12 18:14:51.257683	3	t	jerseys
636	Beta	93	2	2022-07-12 18:14:51.320385	2022-07-12 18:14:51.320385	4	t	beta
637	50% Cotton 50% Elastan	93	6	2022-07-12 18:14:51.383291	2022-07-12 18:14:51.383291	5	t	50-cotton-50-elastan
638	Form	93	7	2022-07-12 18:14:51.446286	2022-07-12 18:14:51.446286	6	t	form
639	Women's	93	8	2022-07-12 18:14:51.515786	2022-07-12 18:14:51.515786	7	t	women-s
640	JacketsandCoats_leatherbikerjacket_26.99	93	3	2022-07-12 18:14:51.58288	2022-07-12 18:14:51.58288	8	t	jacketsandcoats_leatherbikerjacket_26-99
641	Women	88	9	2022-07-12 18:14:51.64928	2022-07-12 18:14:51.64928	1	t	women
642	Women	88	10	2022-07-12 18:14:51.723902	2022-07-12 18:14:51.723902	2	t	women
643	Resiliance	88	1	2022-07-12 18:14:51.79089	2022-07-12 18:14:51.79089	3	t	resiliance
644	Theta	88	2	2022-07-12 18:14:51.873175	2022-07-12 18:14:51.873175	4	t	theta
645	90% Cotton 10% Elastan	88	6	2022-07-12 18:14:51.939619	2022-07-12 18:14:51.939619	5	t	90-cotton-10-elastan
646	Lose	88	7	2022-07-12 18:14:51.992272	2022-07-12 18:14:51.992272	6	t	lose
647	Women's	88	8	2022-07-12 18:14:52.04724	2022-07-12 18:14:52.04724	7	t	women-s
648	JacketsandCoats_longcoatwithbelt_47.99	88	3	2022-07-12 18:14:52.10207	2022-07-12 18:14:52.10207	8	t	jacketsandcoats_longcoatwithbelt_47-99
649	Women	92	9	2022-07-12 18:14:52.158582	2022-07-12 18:14:52.158582	1	t	women
650	Women	92	10	2022-07-12 18:14:52.222203	2022-07-12 18:14:52.222203	2	t	women
651	Wilson	92	1	2022-07-12 18:14:52.281558	2022-07-12 18:14:52.281558	3	t	wilson
652	Alpha	92	2	2022-07-12 18:14:52.341188	2022-07-12 18:14:52.341188	4	t	alpha
653	50% Cotton 50% Elastan	92	6	2022-07-12 18:14:52.400767	2022-07-12 18:14:52.400767	5	t	50-cotton-50-elastan
654	Form	92	7	2022-07-12 18:14:52.458092	2022-07-12 18:14:52.458092	6	t	form
655	Women's	92	8	2022-07-12 18:14:52.524496	2022-07-12 18:14:52.524496	7	t	women-s
656	JacketsandCoats_double-breastedjacket_50.99	92	3	2022-07-12 18:14:52.58619	2022-07-12 18:14:52.58619	8	t	jacketsandcoats_double-breastedjacket_50-99
657	Sportswear	98	9	2022-07-12 18:14:52.6459	2022-07-12 18:14:52.6459	1	t	sportswear
658	Sportswear	98	10	2022-07-12 18:14:52.701561	2022-07-12 18:14:52.701561	2	t	sportswear
659	Resiliance	98	1	2022-07-12 18:14:52.7526	2022-07-12 18:14:52.7526	3	t	resiliance
660	Delta	98	2	2022-07-12 18:14:52.80751	2022-07-12 18:14:52.80751	4	t	delta
661	10% Cotton 90% Elastan	98	6	2022-07-12 18:14:52.860329	2022-07-12 18:14:52.860329	5	t	10-cotton-90-elastan
662	Lose	98	7	2022-07-12 18:14:52.915398	2022-07-12 18:14:52.915398	6	t	lose
663	Women's	98	8	2022-07-12 18:14:52.97353	2022-07-12 18:14:52.97353	7	t	women-s
664	Tops_longsleevesyogacroptop_37.99	98	3	2022-07-12 18:14:53.032634	2022-07-12 18:14:53.032634	8	t	tops_longsleevesyogacroptop_37-99
665	Sportswear	99	9	2022-07-12 18:14:53.095288	2022-07-12 18:14:53.095288	1	t	sportswear
666	Sportswear	99	10	2022-07-12 18:14:53.153411	2022-07-12 18:14:53.153411	2	t	sportswear
667	Wilson	99	1	2022-07-12 18:14:53.210513	2022-07-12 18:14:53.210513	3	t	wilson
668	Alpha	99	2	2022-07-12 18:14:53.266563	2022-07-12 18:14:53.266563	4	t	alpha
669	10% Cotton 90% Elastan	99	6	2022-07-12 18:14:53.321211	2022-07-12 18:14:53.321211	5	t	10-cotton-90-elastan
670	Lose	99	7	2022-07-12 18:14:53.37782	2022-07-12 18:14:53.37782	6	t	lose
671	Women's	99	8	2022-07-12 18:14:53.435022	2022-07-12 18:14:53.435022	7	t	women-s
672	Tops_oversizet-shirtwrappedonback_76.99	99	3	2022-07-12 18:14:53.498087	2022-07-12 18:14:53.498087	8	t	tops_oversizet-shirtwrappedonback_76-99
673	Sportswear	103	9	2022-07-12 18:14:53.56349	2022-07-12 18:14:53.56349	1	t	sportswear
674	Sportswear	103	10	2022-07-12 18:14:53.624425	2022-07-12 18:14:53.624425	2	t	sportswear
675	Wilson	103	1	2022-07-12 18:14:53.706132	2022-07-12 18:14:53.706132	3	t	wilson
676	Epsilon	103	2	2022-07-12 18:14:53.762616	2022-07-12 18:14:53.762616	4	t	epsilon
677	10% Cotton 90% Elastan	103	6	2022-07-12 18:14:53.815412	2022-07-12 18:14:53.815412	5	t	10-cotton-90-elastan
678	Form	103	7	2022-07-12 18:14:53.870631	2022-07-12 18:14:53.870631	6	t	form
679	Women's	103	8	2022-07-12 18:14:53.925163	2022-07-12 18:14:53.925163	7	t	women-s
680	Tops_sportsbra_79.99	103	3	2022-07-12 18:14:54.064684	2022-07-12 18:14:54.064684	8	t	tops_sportsbra_79-99
681	Women	94	9	2022-07-12 18:14:54.118073	2022-07-12 18:14:54.118073	1	t	women
682	Women	94	10	2022-07-12 18:14:54.173696	2022-07-12 18:14:54.173696	2	t	women
683	Wilson	94	1	2022-07-12 18:14:54.226424	2022-07-12 18:14:54.226424	3	t	wilson
684	Gamma	94	2	2022-07-12 18:14:54.281016	2022-07-12 18:14:54.281016	4	t	gamma
685	90% Cotton 10% Elastan	94	6	2022-07-12 18:14:54.338038	2022-07-12 18:14:54.338038	5	t	90-cotton-10-elastan
686	Form	94	7	2022-07-12 18:14:54.394754	2022-07-12 18:14:54.394754	6	t	form
687	Women's	94	8	2022-07-12 18:14:54.480149	2022-07-12 18:14:54.480149	7	t	women-s
688	JacketsandCoats_wool-blendcoatwithbelt_13.99	94	3	2022-07-12 18:14:54.536229	2022-07-12 18:14:54.536229	8	t	jacketsandcoats_wool-blendcoatwithbelt_13-99
689	Sportswear	100	9	2022-07-12 18:14:54.592391	2022-07-12 18:14:54.592391	1	t	sportswear
690	Sportswear	100	10	2022-07-12 18:14:54.649247	2022-07-12 18:14:54.649247	2	t	sportswear
691	Jerseys	100	1	2022-07-12 18:14:54.709101	2022-07-12 18:14:54.709101	3	t	jerseys
692	Alpha	100	2	2022-07-12 18:14:54.764245	2022-07-12 18:14:54.764245	4	t	alpha
693	90% Cotton 10% Elastan	100	6	2022-07-12 18:14:54.821446	2022-07-12 18:14:54.821446	5	t	90-cotton-10-elastan
694	Form	100	7	2022-07-12 18:14:54.889118	2022-07-12 18:14:54.889118	6	t	form
695	Women's	100	8	2022-07-12 18:14:54.960772	2022-07-12 18:14:54.960772	7	t	women-s
696	Tops_longsleevescroptop_34.99	100	3	2022-07-12 18:14:55.037571	2022-07-12 18:14:55.037571	8	t	tops_longsleevescroptop_34-99
697	Sportswear	116	9	2022-07-12 18:14:55.102392	2022-07-12 18:14:55.102392	1	t	sportswear
698	Sportswear	116	10	2022-07-12 18:14:55.157189	2022-07-12 18:14:55.157189	2	t	sportswear
699	Jerseys	116	1	2022-07-12 18:14:55.210603	2022-07-12 18:14:55.210603	3	t	jerseys
700	Zeta	116	2	2022-07-12 18:14:55.262947	2022-07-12 18:14:55.262947	4	t	zeta
701	90% Cotton 10% Elastan	116	6	2022-07-12 18:14:55.314846	2022-07-12 18:14:55.314846	5	t	90-cotton-10-elastan
702	Form	116	7	2022-07-12 18:14:55.367254	2022-07-12 18:14:55.367254	6	t	form
703	Women's	116	8	2022-07-12 18:14:55.423144	2022-07-12 18:14:55.423144	7	t	women-s
704	Pants_highwaistpants_20.99	116	3	2022-07-12 18:14:55.47818	2022-07-12 18:14:55.47818	8	t	pants_highwaistpants_20-99
705	Sportswear	111	9	2022-07-12 18:14:55.53167	2022-07-12 18:14:55.53167	1	t	sportswear
706	Sportswear	111	10	2022-07-12 18:14:55.589364	2022-07-12 18:14:55.589364	2	t	sportswear
707	Wilson	111	1	2022-07-12 18:14:55.649232	2022-07-12 18:14:55.649232	3	t	wilson
708	Alpha	111	2	2022-07-12 18:14:55.713281	2022-07-12 18:14:55.713281	4	t	alpha
709	10% Cotton 90% Elastan	111	6	2022-07-12 18:14:55.774632	2022-07-12 18:14:55.774632	5	t	10-cotton-90-elastan
710	Lose	111	7	2022-07-12 18:14:55.83468	2022-07-12 18:14:55.83468	6	t	lose
711	Women's	111	8	2022-07-12 18:14:55.895585	2022-07-12 18:14:55.895585	7	t	women-s
712	Pants_shortpants_14.99	111	3	2022-07-12 18:14:55.954206	2022-07-12 18:14:55.954206	8	t	pants_shortpants_14-99
713	Sportswear	109	9	2022-07-12 18:14:56.01138	2022-07-12 18:14:56.01138	1	t	sportswear
714	Sportswear	109	10	2022-07-12 18:14:56.061271	2022-07-12 18:14:56.061271	2	t	sportswear
715	Jerseys	109	1	2022-07-12 18:14:56.106932	2022-07-12 18:14:56.106932	3	t	jerseys
716	Theta	109	2	2022-07-12 18:14:56.154284	2022-07-12 18:14:56.154284	4	t	theta
717	50% Cotton 50% Elastan	109	6	2022-07-12 18:14:56.205107	2022-07-12 18:14:56.205107	5	t	50-cotton-50-elastan
718	Lose	109	7	2022-07-12 18:14:56.257026	2022-07-12 18:14:56.257026	6	t	lose
719	Women's	109	8	2022-07-12 18:14:56.307405	2022-07-12 18:14:56.307405	7	t	women-s
720	Sweatshirts_sportwaistcoat_71.99	109	3	2022-07-12 18:14:56.357438	2022-07-12 18:14:56.357438	8	t	sweatshirts_sportwaistcoat_71-99
721	Sportswear	108	9	2022-07-12 18:14:56.44093	2022-07-12 18:14:56.44093	1	t	sportswear
722	Sportswear	108	10	2022-07-12 18:14:56.498845	2022-07-12 18:14:56.498845	2	t	sportswear
723	Resiliance	108	1	2022-07-12 18:14:56.551602	2022-07-12 18:14:56.551602	3	t	resiliance
724	Delta	108	2	2022-07-12 18:14:56.60424	2022-07-12 18:14:56.60424	4	t	delta
725	50% Cotton 50% Elastan	108	6	2022-07-12 18:14:56.659144	2022-07-12 18:14:56.659144	5	t	50-cotton-50-elastan
726	Lose	108	7	2022-07-12 18:14:56.71228	2022-07-12 18:14:56.71228	6	t	lose
727	Women's	108	8	2022-07-12 18:14:56.769308	2022-07-12 18:14:56.769308	7	t	women-s
728	Sweatshirts_sportwindproofjacket_54.99	108	3	2022-07-12 18:14:56.828615	2022-07-12 18:14:56.828615	8	t	sweatshirts_sportwindproofjacket_54-99
729	Sportswear	112	9	2022-07-12 18:14:56.918359	2022-07-12 18:14:56.918359	1	t	sportswear
730	Sportswear	112	10	2022-07-12 18:14:57.051418	2022-07-12 18:14:57.051418	2	t	sportswear
731	Wannabe	112	1	2022-07-12 18:14:57.157398	2022-07-12 18:14:57.157398	3	t	wannabe
732	Theta	112	2	2022-07-12 18:14:57.240315	2022-07-12 18:14:57.240315	4	t	theta
733	90% Cotton 10% Elastan	112	6	2022-07-12 18:14:57.312234	2022-07-12 18:14:57.312234	5	t	90-cotton-10-elastan
734	Lose	112	7	2022-07-12 18:14:57.377648	2022-07-12 18:14:57.377648	6	t	lose
735	Women's	112	8	2022-07-12 18:14:57.446637	2022-07-12 18:14:57.446637	7	t	women-s
736	Pants_printedpantswithholes_45.99	112	3	2022-07-12 18:14:57.514693	2022-07-12 18:14:57.514693	8	t	pants_printedpantswithholes_45-99
737	Women	38	9	2022-07-12 18:14:57.580666	2022-07-12 18:14:57.580666	1	t	women
738	Women	38	10	2022-07-12 18:14:57.636616	2022-07-12 18:14:57.636616	2	t	women
739	Wilson	38	1	2022-07-12 18:14:57.693687	2022-07-12 18:14:57.693687	3	t	wilson
740	Gamma	38	2	2022-07-12 18:14:57.749847	2022-07-12 18:14:57.749847	4	t	gamma
741	50% Cotton 50% Elastan	38	6	2022-07-12 18:14:57.813288	2022-07-12 18:14:57.813288	5	t	50-cotton-50-elastan
742	Form	38	7	2022-07-12 18:14:57.866758	2022-07-12 18:14:57.866758	6	t	form
743	Women's	38	8	2022-07-12 18:14:57.928616	2022-07-12 18:14:57.928616	7	t	women-s
744	Skirts_fittedskirt_62.99	38	3	2022-07-12 18:14:57.994352	2022-07-12 18:14:57.994352	8	t	skirts_fittedskirt_62-99
745	Sportswear	115	9	2022-07-12 18:14:58.060558	2022-07-12 18:14:58.060558	1	t	sportswear
746	Sportswear	115	10	2022-07-12 18:14:58.127035	2022-07-12 18:14:58.127035	2	t	sportswear
747	Conditioned	115	1	2022-07-12 18:14:58.189363	2022-07-12 18:14:58.189363	3	t	conditioned
748	Zeta	115	2	2022-07-12 18:14:58.248893	2022-07-12 18:14:58.248893	4	t	zeta
749	50% Cotton 50% Elastan	115	6	2022-07-12 18:14:58.304855	2022-07-12 18:14:58.304855	5	t	50-cotton-50-elastan
750	Form	115	7	2022-07-12 18:14:58.359942	2022-07-12 18:14:58.359942	6	t	form
751	Women's	115	8	2022-07-12 18:14:58.418137	2022-07-12 18:14:58.418137	7	t	women-s
752	Pants_highwaistpantswithpockets_92.99	115	3	2022-07-12 18:14:58.476584	2022-07-12 18:14:58.476584	8	t	pants_highwaistpantswithpockets_92-99
753	Sportswear	114	9	2022-07-12 18:14:58.533	2022-07-12 18:14:58.533	1	t	sportswear
754	Sportswear	114	10	2022-07-12 18:14:58.587381	2022-07-12 18:14:58.587381	2	t	sportswear
755	Conditioned	114	1	2022-07-12 18:14:58.640382	2022-07-12 18:14:58.640382	3	t	conditioned
756	Beta	114	2	2022-07-12 18:14:58.690202	2022-07-12 18:14:58.690202	4	t	beta
757	50% Cotton 50% Elastan	114	6	2022-07-12 18:14:58.741353	2022-07-12 18:14:58.741353	5	t	50-cotton-50-elastan
758	Lose	114	7	2022-07-12 18:14:58.796707	2022-07-12 18:14:58.796707	6	t	lose
759	Women's	114	8	2022-07-12 18:14:58.852464	2022-07-12 18:14:58.852464	7	t	women-s
760	Pants_printedpants_45.99	114	3	2022-07-12 18:14:58.907972	2022-07-12 18:14:58.907972	8	t	pants_printedpants_45-99
761	Men	15	9	2022-07-12 18:14:58.966144	2022-07-12 18:14:58.966144	9	t	men
762	Men	15	10	2022-07-12 18:14:59.02706	2022-07-12 18:14:59.02706	10	t	men
763	Sportswear	113	9	2022-07-12 18:14:59.359141	2022-07-12 18:14:59.359141	1	t	sportswear
764	Sportswear	113	10	2022-07-12 18:14:59.415969	2022-07-12 18:14:59.415969	2	t	sportswear
765	Wannabe	113	1	2022-07-12 18:14:59.489328	2022-07-12 18:14:59.489328	3	t	wannabe
766	Zeta	113	2	2022-07-12 18:14:59.56667	2022-07-12 18:14:59.56667	4	t	zeta
767	10% Cotton 90% Elastan	113	6	2022-07-12 18:14:59.619405	2022-07-12 18:14:59.619405	5	t	10-cotton-90-elastan
768	Form	113	7	2022-07-12 18:14:59.669315	2022-07-12 18:14:59.669315	6	t	form
769	Women's	113	8	2022-07-12 18:14:59.724911	2022-07-12 18:14:59.724911	7	t	women-s
770	Pants_pants_50.99	113	3	2022-07-12 18:14:59.779372	2022-07-12 18:14:59.779372	8	t	pants_pants_50-99
771	Sportswear	110	9	2022-07-12 18:14:59.841585	2022-07-12 18:14:59.841585	1	t	sportswear
772	Sportswear	110	10	2022-07-12 18:14:59.912283	2022-07-12 18:14:59.912283	2	t	sportswear
773	Wannabe	110	1	2022-07-12 18:14:59.985108	2022-07-12 18:14:59.985108	3	t	wannabe
774	Delta	110	2	2022-07-12 18:15:00.062585	2022-07-12 18:15:00.062585	4	t	delta
775	50% Cotton 50% Elastan	110	6	2022-07-12 18:15:00.131787	2022-07-12 18:15:00.131787	5	t	50-cotton-50-elastan
776	Lose	110	7	2022-07-12 18:15:00.225527	2022-07-12 18:15:00.225527	6	t	lose
777	Women's	110	8	2022-07-12 18:15:00.291477	2022-07-12 18:15:00.291477	7	t	women-s
778	Pants_shinedpants_73.99	110	3	2022-07-12 18:15:00.354903	2022-07-12 18:15:00.354903	8	t	pants_shinedpants_73-99
779	Sportswear	107	9	2022-07-12 18:15:00.417454	2022-07-12 18:15:00.417454	1	t	sportswear
780	Sportswear	107	10	2022-07-12 18:15:00.471098	2022-07-12 18:15:00.471098	2	t	sportswear
781	Wannabe	107	1	2022-07-12 18:15:00.522203	2022-07-12 18:15:00.522203	3	t	wannabe
782	Epsilon	107	2	2022-07-12 18:15:00.574715	2022-07-12 18:15:00.574715	4	t	epsilon
783	10% Cotton 90% Elastan	107	6	2022-07-12 18:15:00.632343	2022-07-12 18:15:00.632343	5	t	10-cotton-90-elastan
784	Form	107	7	2022-07-12 18:15:00.687278	2022-07-12 18:15:00.687278	6	t	form
785	Women's	107	8	2022-07-12 18:15:00.743788	2022-07-12 18:15:00.743788	7	t	women-s
786	Sweatshirts_oversizesweatshirt_67.99	107	3	2022-07-12 18:15:00.801703	2022-07-12 18:15:00.801703	8	t	sweatshirts_oversizesweatshirt_67-99
787	Men	18	9	2022-07-12 18:15:00.861116	2022-07-12 18:15:00.861116	9	t	men
788	Men	18	10	2022-07-12 18:15:00.931077	2022-07-12 18:15:00.931077	10	t	men
789	Men	7	9	2022-07-12 18:15:01.28126	2022-07-12 18:15:01.28126	1	t	men
790	Men	7	10	2022-07-12 18:15:01.334181	2022-07-12 18:15:01.334181	2	t	men
791	Conditioned	7	1	2022-07-12 18:15:01.386463	2022-07-12 18:15:01.386463	3	t	conditioned
792	Alpha	7	2	2022-07-12 18:15:01.438933	2022-07-12 18:15:01.438933	4	t	alpha
793	90% Cotton 10% Elastan	7	6	2022-07-12 18:15:01.488656	2022-07-12 18:15:01.488656	5	t	90-cotton-10-elastan
794	Lose	7	7	2022-07-12 18:15:01.542661	2022-07-12 18:15:01.542661	6	t	lose
795	Men's	7	8	2022-07-12 18:15:01.60001	2022-07-12 18:15:01.60001	7	t	men-s
796	Shirts_regularshirt_94.99	7	3	2022-07-12 18:15:01.658861	2022-07-12 18:15:01.658861	8	t	shirts_regularshirt_94-99
797	Women	86	9	2022-07-12 18:15:01.717123	2022-07-12 18:15:01.717123	1	t	women
798	Women	86	10	2022-07-12 18:15:01.775314	2022-07-12 18:15:01.775314	2	t	women
799	Jerseys	86	1	2022-07-12 18:15:01.83327	2022-07-12 18:15:01.83327	3	t	jerseys
800	Alpha	86	2	2022-07-12 18:15:01.906188	2022-07-12 18:15:01.906188	4	t	alpha
801	10% Cotton 90% Elastan	86	6	2022-07-12 18:15:01.96251	2022-07-12 18:15:01.96251	5	t	10-cotton-90-elastan
802	Lose	86	7	2022-07-12 18:15:02.017665	2022-07-12 18:15:02.017665	6	t	lose
803	Women's	86	8	2022-07-12 18:15:02.072758	2022-07-12 18:15:02.072758	7	t	women-s
804	JacketsandCoats_longwool-blendcoatwithbelt_43.99	86	3	2022-07-12 18:15:02.128582	2022-07-12 18:15:02.128582	8	t	jacketsandcoats_longwool-blendcoatwithbelt_43-99
805	Sportswear	105	9	2022-07-12 18:15:02.18435	2022-07-12 18:15:02.18435	1	t	sportswear
806	Sportswear	105	10	2022-07-12 18:15:02.24092	2022-07-12 18:15:02.24092	2	t	sportswear
807	Resiliance	105	1	2022-07-12 18:15:02.293491	2022-07-12 18:15:02.293491	3	t	resiliance
808	Beta	105	2	2022-07-12 18:15:02.347376	2022-07-12 18:15:02.347376	4	t	beta
809	10% Cotton 90% Elastan	105	6	2022-07-12 18:15:02.406041	2022-07-12 18:15:02.406041	5	t	10-cotton-90-elastan
810	Form	105	7	2022-07-12 18:15:02.465208	2022-07-12 18:15:02.465208	6	t	form
811	Women's	105	8	2022-07-12 18:15:02.529164	2022-07-12 18:15:02.529164	7	t	women-s
812	Sweatshirts_runningsweatshirt_17.99	105	3	2022-07-12 18:15:02.591327	2022-07-12 18:15:02.591327	8	t	sweatshirts_runningsweatshirt_17-99
813	Women	79	9	2022-07-12 18:15:02.64743	2022-07-12 18:15:02.64743	9	t	women
814	Women	79	10	2022-07-12 18:15:02.704576	2022-07-12 18:15:02.704576	10	t	women
91	TopsandT-shirts_pleatedsleevet-shirt_83.99	79	3	2022-07-12 18:14:15.832201	2022-07-12 18:15:02.93374	3	t	topsandt-shirts_pleatedsleevet-shirt_83-99
815	Women	89	9	2022-07-12 18:15:02.987193	2022-07-12 18:15:02.987193	1	t	women
816	Women	89	10	2022-07-12 18:15:03.043979	2022-07-12 18:15:03.043979	2	t	women
817	Wannabe	89	1	2022-07-12 18:15:03.099073	2022-07-12 18:15:03.099073	3	t	wannabe
818	Alpha	89	2	2022-07-12 18:15:03.155439	2022-07-12 18:15:03.155439	4	t	alpha
819	90% Cotton 10% Elastan	89	6	2022-07-12 18:15:03.211528	2022-07-12 18:15:03.211528	5	t	90-cotton-10-elastan
820	Lose	89	7	2022-07-12 18:15:03.266824	2022-07-12 18:15:03.266824	6	t	lose
821	Women's	89	8	2022-07-12 18:15:03.352964	2022-07-12 18:15:03.352964	7	t	women-s
822	JacketsandCoats_downjacket_59.99	89	3	2022-07-12 18:15:03.408085	2022-07-12 18:15:03.408085	8	t	jacketsandcoats_downjacket_59-99
823	Women	69	9	2022-07-12 18:15:03.459999	2022-07-12 18:15:03.459999	1	t	women
824	Women	69	10	2022-07-12 18:15:03.513931	2022-07-12 18:15:03.513931	2	t	women
825	Resiliance	69	1	2022-07-12 18:15:03.565514	2022-07-12 18:15:03.565514	3	t	resiliance
826	Gamma	69	2	2022-07-12 18:15:03.618632	2022-07-12 18:15:03.618632	4	t	gamma
827	50% Cotton 50% Elastan	69	6	2022-07-12 18:15:03.668593	2022-07-12 18:15:03.668593	5	t	50-cotton-50-elastan
828	Lose	69	7	2022-07-12 18:15:03.717809	2022-07-12 18:15:03.717809	6	t	lose
829	Women's	69	8	2022-07-12 18:15:03.771474	2022-07-12 18:15:03.771474	7	t	women-s
830	ShirtsandBlouses_printedshirt_46.99	69	3	2022-07-12 18:15:03.824216	2022-07-12 18:15:03.824216	8	t	shirtsandblouses_printedshirt_46-99
831	Men	17	9	2022-07-12 18:15:03.878149	2022-07-12 18:15:03.878149	9	t	men
832	Men	17	10	2022-07-12 18:15:03.931658	2022-07-12 18:15:03.931658	10	t	men
41	Wannabe	17	1	2022-07-12 18:14:13.340865	2022-07-12 18:15:03.982017	1	t	wannabe
833	Men	27	9	2022-07-12 18:15:04.269614	2022-07-12 18:15:04.269614	1	t	men
834	Men	27	10	2022-07-12 18:15:04.328549	2022-07-12 18:15:04.328549	2	t	men
835	Conditioned	27	1	2022-07-12 18:15:04.382408	2022-07-12 18:15:04.382408	3	t	conditioned
836	Beta	27	2	2022-07-12 18:15:04.436218	2022-07-12 18:15:04.436218	4	t	beta
837	10% Cotton 90% Elastan	27	6	2022-07-12 18:15:04.490025	2022-07-12 18:15:04.490025	5	t	10-cotton-90-elastan
838	Lose	27	7	2022-07-12 18:15:04.54312	2022-07-12 18:15:04.54312	6	t	lose
839	Men's	27	8	2022-07-12 18:15:04.600442	2022-07-12 18:15:04.600442	7	t	men-s
840	Sweaters_longsleevejumper_64.99	27	3	2022-07-12 18:15:04.657347	2022-07-12 18:15:04.657347	8	t	sweaters_longsleevejumper_64-99
841	Women	54	9	2022-07-12 18:15:04.717353	2022-07-12 18:15:04.717353	1	t	women
842	Women	54	10	2022-07-12 18:15:04.774719	2022-07-12 18:15:04.774719	2	t	women
843	Wilson	54	1	2022-07-12 18:15:04.834557	2022-07-12 18:15:04.834557	3	t	wilson
844	Alpha	54	2	2022-07-12 18:15:04.886604	2022-07-12 18:15:04.886604	4	t	alpha
845	10% Cotton 90% Elastan	54	6	2022-07-12 18:15:04.941464	2022-07-12 18:15:04.941464	5	t	10-cotton-90-elastan
846	Form	54	7	2022-07-12 18:15:04.997063	2022-07-12 18:15:04.997063	6	t	form
847	Women's	54	8	2022-07-12 18:15:05.053353	2022-07-12 18:15:05.053353	7	t	women-s
848	Dresses_dresswithbelt_36.99	54	3	2022-07-12 18:15:05.111652	2022-07-12 18:15:05.111652	8	t	dresses_dresswithbelt_36-99
849	Women	70	9	2022-07-12 18:15:05.168241	2022-07-12 18:15:05.168241	1	t	women
850	Women	70	10	2022-07-12 18:15:05.230082	2022-07-12 18:15:05.230082	2	t	women
851	Wannabe	70	1	2022-07-12 18:15:05.286926	2022-07-12 18:15:05.286926	3	t	wannabe
852	Epsilon	70	2	2022-07-12 18:15:05.344511	2022-07-12 18:15:05.344511	4	t	epsilon
853	10% Cotton 90% Elastan	70	6	2022-07-12 18:15:05.406874	2022-07-12 18:15:05.406874	5	t	10-cotton-90-elastan
854	Lose	70	7	2022-07-12 18:15:05.466551	2022-07-12 18:15:05.466551	6	t	lose
855	Women's	70	8	2022-07-12 18:15:05.534793	2022-07-12 18:15:05.534793	7	t	women-s
856	Sweaters_asymmetricsweaterwithwidesleeves_34.99	70	3	2022-07-12 18:15:05.598625	2022-07-12 18:15:05.598625	8	t	sweaters_asymmetricsweaterwithwidesleeves_34-99
857	Women	65	9	2022-07-12 18:15:05.664127	2022-07-12 18:15:05.664127	1	t	women
858	Women	65	10	2022-07-12 18:15:05.724132	2022-07-12 18:15:05.724132	2	t	women
859	Wannabe	65	1	2022-07-12 18:15:05.782726	2022-07-12 18:15:05.782726	3	t	wannabe
860	Zeta	65	2	2022-07-12 18:15:05.839787	2022-07-12 18:15:05.839787	4	t	zeta
861	50% Cotton 50% Elastan	65	6	2022-07-12 18:15:05.921024	2022-07-12 18:15:05.921024	5	t	50-cotton-50-elastan
862	Lose	65	7	2022-07-12 18:15:05.976685	2022-07-12 18:15:05.976685	6	t	lose
863	Women's	65	8	2022-07-12 18:15:06.035149	2022-07-12 18:15:06.035149	7	t	women-s
864	ShirtsandBlouses_elegantblousewithchocker_19.99	65	3	2022-07-12 18:15:06.093098	2022-07-12 18:15:06.093098	8	t	shirtsandblouses_elegantblousewithchocker_19-99
865	Sportswear	97	9	2022-07-12 18:15:06.151404	2022-07-12 18:15:06.151404	1	t	sportswear
866	Sportswear	97	10	2022-07-12 18:15:06.213916	2022-07-12 18:15:06.213916	2	t	sportswear
867	Jerseys	97	1	2022-07-12 18:15:06.274859	2022-07-12 18:15:06.274859	3	t	jerseys
868	Delta	97	2	2022-07-12 18:15:06.334753	2022-07-12 18:15:06.334753	4	t	delta
869	90% Cotton 10% Elastan	97	6	2022-07-12 18:15:06.397755	2022-07-12 18:15:06.397755	5	t	90-cotton-10-elastan
870	Form	97	7	2022-07-12 18:15:06.460583	2022-07-12 18:15:06.460583	6	t	form
871	Women's	97	8	2022-07-12 18:15:06.535158	2022-07-12 18:15:06.535158	7	t	women-s
872	Tops_sportsbralowsupport_41.99	97	3	2022-07-12 18:15:06.599944	2022-07-12 18:15:06.599944	8	t	tops_sportsbralowsupport_41-99
873	Men	30	9	2022-07-12 18:15:06.660424	2022-07-12 18:15:06.660424	1	t	men
874	Men	30	10	2022-07-12 18:15:06.712951	2022-07-12 18:15:06.712951	2	t	men
875	Conditioned	30	1	2022-07-12 18:15:06.764968	2022-07-12 18:15:06.764968	3	t	conditioned
876	Theta	30	2	2022-07-12 18:15:06.815411	2022-07-12 18:15:06.815411	4	t	theta
877	10% Cotton 90% Elastan	30	6	2022-07-12 18:15:06.897563	2022-07-12 18:15:06.897563	5	t	10-cotton-90-elastan
878	Form	30	7	2022-07-12 18:15:06.9822	2022-07-12 18:15:06.9822	6	t	form
879	Men's	30	8	2022-07-12 18:15:07.064426	2022-07-12 18:15:07.064426	7	t	men-s
880	JacketsandCoats_anorakwithhood_44.99	30	3	2022-07-12 18:15:07.133964	2022-07-12 18:15:07.133964	8	t	jacketsandcoats_anorakwithhood_44-99
881	Women	48	9	2022-07-12 18:15:07.194188	2022-07-12 18:15:07.194188	1	t	women
882	Women	48	10	2022-07-12 18:15:07.255898	2022-07-12 18:15:07.255898	2	t	women
883	Wilson	48	1	2022-07-12 18:15:07.315402	2022-07-12 18:15:07.315402	3	t	wilson
884	Beta	48	2	2022-07-12 18:15:07.370616	2022-07-12 18:15:07.370616	4	t	beta
885	90% Cotton 10% Elastan	48	6	2022-07-12 18:15:07.428677	2022-07-12 18:15:07.428677	5	t	90-cotton-10-elastan
886	Lose	48	7	2022-07-12 18:15:07.485068	2022-07-12 18:15:07.485068	6	t	lose
887	Women's	48	8	2022-07-12 18:15:07.542411	2022-07-12 18:15:07.542411	7	t	women-s
888	Dresses_flareddress_81.99	48	3	2022-07-12 18:15:07.600432	2022-07-12 18:15:07.600432	8	t	dresses_flareddress_81-99
889	Men	11	9	2022-07-12 18:15:07.65831	2022-07-12 18:15:07.65831	1	t	men
890	Men	11	10	2022-07-12 18:15:07.716717	2022-07-12 18:15:07.716717	2	t	men
891	Jerseys	11	1	2022-07-12 18:15:07.773978	2022-07-12 18:15:07.773978	3	t	jerseys
892	Alpha	11	2	2022-07-12 18:15:07.831254	2022-07-12 18:15:07.831254	4	t	alpha
893	90% Cotton 10% Elastan	11	6	2022-07-12 18:15:07.888118	2022-07-12 18:15:07.888118	5	t	90-cotton-10-elastan
894	Lose	11	7	2022-07-12 18:15:07.945052	2022-07-12 18:15:07.945052	6	t	lose
895	Men's	11	8	2022-07-12 18:15:08.002794	2022-07-12 18:15:08.002794	7	t	men-s
896	Shirts_regularshirtwithrolledupsleeves_98.99	11	3	2022-07-12 18:15:08.060264	2022-07-12 18:15:08.060264	8	t	shirts_regularshirtwithrolledupsleeves_98-99
897	Women	74	9	2022-07-12 18:15:08.121534	2022-07-12 18:15:08.121534	1	t	women
898	Women	74	10	2022-07-12 18:15:08.184279	2022-07-12 18:15:08.184279	2	t	women
899	Wilson	74	1	2022-07-12 18:15:08.244798	2022-07-12 18:15:08.244798	3	t	wilson
900	Theta	74	2	2022-07-12 18:15:08.300802	2022-07-12 18:15:08.300802	4	t	theta
901	10% Cotton 90% Elastan	74	6	2022-07-12 18:15:08.354863	2022-07-12 18:15:08.354863	5	t	10-cotton-90-elastan
902	Lose	74	7	2022-07-12 18:15:08.408293	2022-07-12 18:15:08.408293	6	t	lose
903	Women's	74	8	2022-07-12 18:15:08.464895	2022-07-12 18:15:08.464895	7	t	women-s
904	Sweaters_knittedv-necksweater_17.99	74	3	2022-07-12 18:15:08.522218	2022-07-12 18:15:08.522218	8	t	sweaters_knittedv-necksweater_17-99
905	Women	90	9	2022-07-12 18:15:08.589137	2022-07-12 18:15:08.589137	1	t	women
906	Women	90	10	2022-07-12 18:15:08.648384	2022-07-12 18:15:08.648384	2	t	women
907	Conditioned	90	1	2022-07-12 18:15:08.704743	2022-07-12 18:15:08.704743	3	t	conditioned
908	Theta	90	2	2022-07-12 18:15:08.76034	2022-07-12 18:15:08.76034	4	t	theta
909	90% Cotton 10% Elastan	90	6	2022-07-12 18:15:08.814682	2022-07-12 18:15:08.814682	5	t	90-cotton-10-elastan
910	Lose	90	7	2022-07-12 18:15:08.871065	2022-07-12 18:15:08.871065	6	t	lose
911	Women's	90	8	2022-07-12 18:15:08.928928	2022-07-12 18:15:08.928928	7	t	women-s
912	JacketsandCoats_zippedjacket_28.99	90	3	2022-07-12 18:15:08.98631	2022-07-12 18:15:08.98631	8	t	jacketsandcoats_zippedjacket_28-99
913	Men	20	9	2022-07-12 18:15:09.04379	2022-07-12 18:15:09.04379	1	t	men
914	Men	20	10	2022-07-12 18:15:09.10294	2022-07-12 18:15:09.10294	2	t	men
915	Conditioned	20	1	2022-07-12 18:15:09.188529	2022-07-12 18:15:09.188529	3	t	conditioned
916	Alpha	20	2	2022-07-12 18:15:09.246609	2022-07-12 18:15:09.246609	4	t	alpha
917	90% Cotton 10% Elastan	20	6	2022-07-12 18:15:09.303091	2022-07-12 18:15:09.303091	5	t	90-cotton-10-elastan
918	Form	20	7	2022-07-12 18:15:09.359207	2022-07-12 18:15:09.359207	6	t	form
919	Men's	20	8	2022-07-12 18:15:09.418231	2022-07-12 18:15:09.418231	7	t	men-s
920	Sweaters_highnecksweater_45.99	20	3	2022-07-12 18:15:09.476192	2022-07-12 18:15:09.476192	8	t	sweaters_highnecksweater_45-99
921	Men	32	9	2022-07-12 18:15:09.534994	2022-07-12 18:15:09.534994	1	t	men
922	Men	32	10	2022-07-12 18:15:09.592303	2022-07-12 18:15:09.592303	2	t	men
923	Resiliance	32	1	2022-07-12 18:15:09.647675	2022-07-12 18:15:09.647675	3	t	resiliance
924	Alpha	32	2	2022-07-12 18:15:09.701667	2022-07-12 18:15:09.701667	4	t	alpha
925	90% Cotton 10% Elastan	32	6	2022-07-12 18:15:09.75663	2022-07-12 18:15:09.75663	5	t	90-cotton-10-elastan
926	Lose	32	7	2022-07-12 18:15:09.810684	2022-07-12 18:15:09.810684	6	t	lose
927	Men's	32	8	2022-07-12 18:15:09.865816	2022-07-12 18:15:09.865816	7	t	men-s
928	JacketsandCoats_wool-blendshortcoat_27.99	32	3	2022-07-12 18:15:09.922424	2022-07-12 18:15:09.922424	8	t	jacketsandcoats_wool-blendshortcoat_27-99
929	Women	39	9	2022-07-12 18:15:09.979948	2022-07-12 18:15:09.979948	1	t	women
930	Women	39	10	2022-07-12 18:15:10.043259	2022-07-12 18:15:10.043259	2	t	women
931	Conditioned	39	1	2022-07-12 18:15:10.100284	2022-07-12 18:15:10.100284	3	t	conditioned
932	Beta	39	2	2022-07-12 18:15:10.158408	2022-07-12 18:15:10.158408	4	t	beta
933	10% Cotton 90% Elastan	39	6	2022-07-12 18:15:10.216402	2022-07-12 18:15:10.216402	5	t	10-cotton-90-elastan
934	Form	39	7	2022-07-12 18:15:10.273344	2022-07-12 18:15:10.273344	6	t	form
935	Women's	39	8	2022-07-12 18:15:10.404796	2022-07-12 18:15:10.404796	7	t	women-s
936	Skirts_a-linesuedeskirt_30.99	39	3	2022-07-12 18:15:10.463474	2022-07-12 18:15:10.463474	8	t	skirts_a-linesuedeskirt_30-99
937	Women	47	9	2022-07-12 18:15:10.526228	2022-07-12 18:15:10.526228	1	t	women
938	Women	47	10	2022-07-12 18:15:10.591234	2022-07-12 18:15:10.591234	2	t	women
939	Resiliance	47	1	2022-07-12 18:15:10.657115	2022-07-12 18:15:10.657115	3	t	resiliance
940	Delta	47	2	2022-07-12 18:15:10.725426	2022-07-12 18:15:10.725426	4	t	delta
941	10% Cotton 90% Elastan	47	6	2022-07-12 18:15:10.791435	2022-07-12 18:15:10.791435	5	t	10-cotton-90-elastan
942	Form	47	7	2022-07-12 18:15:10.853049	2022-07-12 18:15:10.853049	6	t	form
943	Women's	47	8	2022-07-12 18:15:10.922067	2022-07-12 18:15:10.922067	7	t	women-s
944	Dresses_v-neckfloralmaxidress_31.99	47	3	2022-07-12 18:15:10.99248	2022-07-12 18:15:10.99248	8	t	dresses_v-neckfloralmaxidress_31-99
945	Women	45	9	2022-07-12 18:15:11.060999	2022-07-12 18:15:11.060999	1	t	women
946	Women	45	10	2022-07-12 18:15:11.121678	2022-07-12 18:15:11.121678	2	t	women
947	Wannabe	45	1	2022-07-12 18:15:11.178274	2022-07-12 18:15:11.178274	3	t	wannabe
948	Delta	45	2	2022-07-12 18:15:11.232608	2022-07-12 18:15:11.232608	4	t	delta
949	50% Cotton 50% Elastan	45	6	2022-07-12 18:15:11.285564	2022-07-12 18:15:11.285564	5	t	50-cotton-50-elastan
950	Lose	45	7	2022-07-12 18:15:11.341001	2022-07-12 18:15:11.341001	6	t	lose
951	Women's	45	8	2022-07-12 18:15:11.398558	2022-07-12 18:15:11.398558	7	t	women-s
952	Skirts_pleatedskirt2_17.99	45	3	2022-07-12 18:15:11.452518	2022-07-12 18:15:11.452518	8	t	skirts_pleatedskirt2_17-99
953	Women	55	9	2022-07-12 18:15:11.507922	2022-07-12 18:15:11.507922	1	t	women
954	Women	55	10	2022-07-12 18:15:11.567953	2022-07-12 18:15:11.567953	2	t	women
955	Wilson	55	1	2022-07-12 18:15:11.634626	2022-07-12 18:15:11.634626	3	t	wilson
956	Gamma	55	2	2022-07-12 18:15:11.698952	2022-07-12 18:15:11.698952	4	t	gamma
957	50% Cotton 50% Elastan	55	6	2022-07-12 18:15:11.765016	2022-07-12 18:15:11.765016	5	t	50-cotton-50-elastan
958	Lose	55	7	2022-07-12 18:15:11.853002	2022-07-12 18:15:11.853002	6	t	lose
959	Women's	55	8	2022-07-12 18:15:11.918641	2022-07-12 18:15:11.918641	7	t	women-s
960	Dresses_v-neckfloraldress_73.99	55	3	2022-07-12 18:15:11.987754	2022-07-12 18:15:11.987754	8	t	dresses_v-neckfloraldress_73-99
961	Women	80	9	2022-07-12 18:15:12.054829	2022-07-12 18:15:12.054829	9	t	women
962	Women	80	10	2022-07-12 18:15:12.113717	2022-07-12 18:15:12.113717	10	t	women
\.


--
-- Data for Name: spree_products; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.spree_products (id, name, description, available_on, deleted_at, slug, meta_description, meta_keywords, tax_category_id, shipping_category_id, created_at, updated_at, promotionable, meta_title, discontinue_on, public_metadata, private_metadata) FROM stdin;
14	3 4 Sleeve T Shirt	Esse quisquam cupiditate ab saepe suscipit rerum ea aperiam. Inventore expedita tenetur aut beatae. Quae deleniti distinctio dignissimos labore. Labore expedita illum eius itaque provident.	2022-07-12 18:13:21.673176	\N	3-4-sleeve-t-shirt	\N	\N	1	1	2022-07-12 18:13:21.774208	2022-07-12 18:21:47.421685	t	\N	\N	\N	\N
1	Denim Shirt	Harum suscipit a sunt blanditiis nisi. Itaque labore commodi ipsa mollitia. Minus laboriosam est nemo earum sunt.	2022-07-12 18:13:17.026782	\N	denim-shirt	\N	\N	1	1	2022-07-12 18:13:17.233973	2022-07-12 18:15:34.503553	t	\N	\N	\N	\N
3	Covered Placket Shirt	Distinctio fugiat iste nobis enim non earum. Autem minus facere quos minima perspiciatis vel ad. Qui deserunt ex accusantium laboriosam rerum vitae. Provident ducimus itaque modi alias perferendis consectetur. A pariatur amet dicta dolorum.	2022-07-12 18:13:17.960419	\N	covered-placket-shirt	\N	\N	1	1	2022-07-12 18:13:18.063139	2022-07-12 18:15:34.78794	t	\N	\N	\N	\N
29	Hooded Jacket	Incidunt rem repellat fuga hic illum. Dolor incidunt ullam mollitia cumque. Velit cumque placeat voluptatibus enim. Ad iusto fugiat maxime necessitatibus optio.	2022-07-12 18:13:27.356685	\N	hooded-jacket	\N	\N	1	1	2022-07-12 18:13:27.474123	2022-07-12 18:15:38.481645	t	\N	\N	\N	\N
36	Flared Midi Skirt	Necessitatibus ratione quos hic suscipit exercitationem corrupti. Dolorem nulla sint natus aliquid expedita. Facere officiis odio sint delectus molestiae aut recusandae. Sed molestias saepe ad nobis praesentium blanditiis. Facere corrupti sit quaerat iste officiis excepturi inventore.	2022-07-12 18:13:30.177617	\N	flared-midi-skirt	\N	\N	1	1	2022-07-12 18:13:30.290347	2022-07-12 18:15:39.943916	t	\N	\N	\N	\N
42	Skater Skirt	Dolor sit nisi commodi nostrum beatae culpa. Molestiae quos alias odit rem distinctio dicta in. Aperiam repellat totam recusandae quaerat pariatur labore. Voluptates necessitatibus incidunt alias magnam laudantium eos. Mollitia sed corporis dolor at nemo rerum.	2022-07-12 18:13:32.349681	\N	skater-skirt	\N	\N	1	1	2022-07-12 18:13:32.468571	2022-07-12 18:15:40.928845	t	\N	\N	\N	\N
43	Skater Short Skirt	Velit quae iusto quas repellat non molestiae quisquam. Recusandae esse fugiat animi hic veniam. Debitis laborum accusantium animi voluptatum eligendi modi temporibus. Exercitationem natus voluptatibus aspernatur reiciendis suscipit. Dolor enim veniam ratione eos unde.	2022-07-12 18:13:32.719069	\N	skater-short-skirt	\N	\N	1	1	2022-07-12 18:13:32.829835	2022-07-12 18:15:41.074581	t	\N	\N	\N	\N
46	Floral Wrap Dress	Recusandae minus temporibus cumque cupiditate necessitatibus labore reiciendis culpa. Cumque quibusdam corporis suscipit qui nostrum quidem. Culpa dignissimos eligendi deserunt neque vero. Fuga error ea porro esse ratione incidunt.	2022-07-12 18:13:33.870099	\N	floral-wrap-dress	\N	\N	1	1	2022-07-12 18:13:34.090368	2022-07-12 18:15:41.531471	t	\N	\N	\N	\N
51	Striped Shirt Dress	Iusto reiciendis omnis aut alias. Natus quisquam nostrum at cupiditate harum ratione accusantium. Quo dolor voluptatum distinctio odio voluptatem. Laudantium hic perspiciatis facilis commodi architecto. Adipisci earum nam dolorem at fugiat dolores.	2022-07-12 18:13:35.817391	\N	striped-shirt-dress	\N	\N	1	1	2022-07-12 18:13:35.938824	2022-07-12 18:15:42.396627	t	\N	\N	\N	\N
67	Semi Sheer Shirt With Pockets	Suscipit quod explicabo culpa placeat incidunt animi ad. Maiores ad praesentium corrupti eos. Animi voluptas non rem occaecati.	2022-07-12 18:13:41.670246	\N	semi-sheer-shirt-with-pockets	\N	\N	1	1	2022-07-12 18:13:41.779463	2022-07-12 18:15:45.144057	t	\N	\N	\N	\N
71	Oversized Knitted Sweater	Eius quod sunt modi nulla aspernatur illo. Magni veniam aperiam illum voluptatem alias maiores. Repellat commodi quo iste possimus.	2022-07-12 18:13:43.162257	\N	oversized-knitted-sweater	\N	\N	1	1	2022-07-12 18:13:43.280082	2022-07-12 18:15:45.814463	t	\N	\N	\N	\N
87	Asymmetric Coat	Numquam necessitatibus quo dolores sapiente minima nihil. Tempora alias ut sapiente eaque. Officiis voluptates veniam exercitationem laborum inventore. Odio dicta quas asperiores expedita saepe molestias. Delectus quos ipsam itaque quam odit debitis deserunt assumenda.	2022-07-12 18:13:49.777333	\N	asymmetric-coat	\N	\N	1	1	2022-07-12 18:13:49.8979	2022-07-12 18:15:48.618519	t	\N	\N	\N	\N
92	Double Breasted Jacket	Ullam neque quidem officiis nisi pariatur explicabo quibusdam odio. Ullam quis et laudantium eius sunt dolor ab architecto. Dignissimos explicabo quae amet incidunt omnis.	2022-07-12 18:13:51.978032	\N	double-breasted-jacket	\N	\N	1	1	2022-07-12 18:13:52.148849	2022-07-12 18:15:49.390799	t	\N	\N	\N	\N
96	Bomber Jacket	Laboriosam eaque animi impedit tempora eum corrupti. Ut exercitationem mollitia necessitatibus officia nemo nobis. Qui eius dolore officiis nostrum veniam.	2022-07-12 18:13:53.587633	\N	bomber-jacket	\N	\N	1	1	2022-07-12 18:13:53.739252	2022-07-12 18:15:49.999719	t	\N	\N	\N	\N
4	Slim Fit Shirt	Maxime unde magni sed eos amet asperiores. Modi est vel enim tempore iste accusantium. Error ad vitae expedita doloremque numquam.	2022-07-12 18:13:18.289352	\N	slim-fit-shirt	\N	\N	1	1	2022-07-12 18:13:18.401467	2022-07-12 18:15:34.936991	t	\N	\N	\N	\N
83	Sleeveless Loose Top	Harum sint ad vero voluptate accusantium natus. Sit laudantium explicabo velit ipsa tempore. Tenetur nemo quibusdam molestiae laudantium distinctio eum adipisci. Fugiat animi voluptate quas praesentium sunt repudiandae quasi consequatur.	2022-07-12 18:13:48.268389	\N	sleeveless-loose-top	\N	\N	1	1	2022-07-12 18:13:48.404769	2022-07-12 18:15:47.982004	t	\N	\N	\N	\N
107	Oversize Sweatshirt	Incidunt possimus nesciunt ea quo nihil. Harum repellat soluta sint nemo eius consequatur blanditiis consectetur. Eius voluptates consectetur facere maiores vel temporibus facilis ipsum. Corporis sunt saepe laboriosam porro. Porro assumenda optio reiciendis molestiae quaerat laborum.	2022-07-12 18:13:57.806171	\N	oversize-sweatshirt	\N	\N	1	1	2022-07-12 18:13:57.929854	2022-07-12 18:15:51.703709	t	\N	\N	\N	\N
27	Long Sleeve Jumper	Veritatis aspernatur vero eius rerum nam doloremque iure similique. Minima explicabo nostrum aperiam ipsam veritatis. Natus id deleniti cupiditate ex vero exercitationem amet error.	2022-07-12 18:13:26.52462	\N	long-sleeve-jumper	\N	\N	1	1	2022-07-12 18:13:26.635809	2022-07-12 18:15:38.142806	t	\N	\N	\N	\N
54	Dress With Belt	Iusto aut architecto sequi inventore quod delectus eligendi minima. In quod animi quisquam fuga ratione. Iusto incidunt sequi quis dicta sapiente tempore.	2022-07-12 18:13:36.930584	\N	dress-with-belt	\N	\N	1	1	2022-07-12 18:13:37.043743	2022-07-12 18:15:42.866922	t	\N	\N	\N	\N
74	Knitted V Neck Sweater	Aspernatur laboriosam blanditiis minima ipsa exercitationem. Magnam pariatur eaque tempora saepe ad vero. Facilis commodi nihil quae quod. Itaque illum ipsa porro quibusdam.	2022-07-12 18:13:44.266041	\N	knitted-v-neck-sweater	\N	\N	1	1	2022-07-12 18:13:44.38903	2022-07-12 18:15:46.39376	t	\N	\N	\N	\N
45	Pleated Skirt 2	Fugiat iure doloremque vitae laudantium odit. Quos possimus at deserunt provident perferendis architecto natus suscipit. Deserunt corrupti consectetur dolore labore corporis quibusdam voluptatem sequi. Perspiciatis incidunt ab error nobis animi.	2022-07-12 18:13:33.459005	\N	pleated-skirt-2	\N	\N	1	1	2022-07-12 18:13:33.572055	2022-07-12 18:15:41.377902	t	\N	\N	\N	\N
47	V Neck Floral Maxi Dress	Sit asperiores nihil incidunt iste iusto natus sint. Molestiae consequuntur recusandae facilis atque totam dolorem dolorum ea. Labore aspernatur vel autem minima voluptates magni. Nihil sit quod numquam eius facere eum in minima.	2022-07-12 18:13:34.354511	\N	v-neck-floral-maxi-dress	\N	\N	1	1	2022-07-12 18:13:34.473636	2022-07-12 18:15:41.709375	t	\N	\N	\N	\N
90	Zipped Jacket	Voluptatum praesentium dolorem eum neque. Necessitatibus veniam perferendis cupiditate nulla velit. Perspiciatis ratione eligendi delectus sapiente assumenda. Vero ex explicabo dolorum fuga molestiae odio.	2022-07-12 18:13:51.087881	\N	zipped-jacket	\N	\N	1	1	2022-07-12 18:13:51.205812	2022-07-12 18:15:49.077477	t	\N	\N	\N	\N
6	Printed Short Sleeve Shirt	Voluptatibus perspiciatis tempore recusandae reiciendis. Et aliquam velit molestiae iure occaecati dolore eum. Minus facilis commodi adipisci placeat excepturi in esse.	2022-07-12 18:13:18.967612	\N	printed-short-sleeve-shirt	\N	\N	1	1	2022-07-12 18:13:19.074261	2022-07-12 18:15:35.230068	t	\N	\N	\N	\N
22	Long Sleeve Jumper With Pocket	Delectus ratione in aspernatur consequuntur minus praesentium laborum. Quia excepturi optio aliquid fugit voluptatibus in vel itaque. Rerum libero reiciendis temporibus recusandae possimus fuga minus distinctio. Id ipsum totam itaque recusandae magni quibusdam sed adipisci.	2022-07-12 18:13:24.645297	\N	long-sleeve-jumper-with-pocket	\N	\N	1	1	2022-07-12 18:13:24.764565	2022-07-12 18:15:37.423612	t	\N	\N	\N	\N
9	Dotted Shirt	Mollitia magni atque alias eligendi qui cupiditate deleniti eos. Magnam excepturi voluptatum atque harum eaque architecto. Ducimus magnam at labore exercitationem quae. Possimus tempora animi qui atque voluptatem minus ipsum accusamus.	2022-07-12 18:13:19.992871	\N	dotted-shirt	\N	\N	1	1	2022-07-12 18:13:20.098254	2022-07-12 18:15:35.661547	t	\N	\N	\N	\N
80	Scrappy Crop Top With Tie	Quod eos consectetur nihil ut fugiat labore iusto. Exercitationem error enim commodi magnam est. Explicabo eaque iste eveniet asperiores beatae. Ex modi repudiandae labore aperiam cumque. Omnis reiciendis placeat possimus ad molestiae illo incidunt exercitationem.	2022-07-12 18:13:47.219704	\N	scrappy-crop-top-with-tie	\N	\N	1	1	2022-07-12 18:13:47.327846	2022-07-12 18:15:47.516858	t	\N	\N	\N	\N
8	Checked Slim Fit Shirt	Distinctio eum pariatur consectetur quod tempore laudantium exercitationem. Magnam occaecati accusantium debitis libero dolorum quaerat. Voluptatibus praesentium reprehenderit iusto ea cum. Beatae possimus porro velit error corrupti. Ea dolore amet nostrum voluptate similique.	2022-07-12 18:13:19.646856	\N	checked-slim-fit-shirt	\N	\N	1	1	2022-07-12 18:13:19.751861	2022-07-12 18:15:35.514936	t	\N	\N	\N	\N
21	Stripped Jumper	Odio ex possimus molestias ut architecto. Dolor neque corrupti recusandae voluptas ratione doloremque aut. Error id recusandae dolorem aliquid eos. Quae consectetur ducimus cum dignissimos debitis neque enim. Sunt doloremque ullam provident nobis.	2022-07-12 18:13:24.29614	\N	stripped-jumper	\N	\N	1	1	2022-07-12 18:13:24.405774	2022-07-12 18:15:37.28686	t	\N	\N	\N	\N
2	Checked Shirt	Incidunt in sunt ea id nostrum assumenda nemo velit. Soluta impedit occaecati molestiae inventore vel eius minus tenetur. Quis in rerum ipsa incidunt fuga.	2022-07-12 18:13:17.470012	\N	checked-shirt	\N	\N	1	1	2022-07-12 18:13:17.570674	2022-07-12 18:15:34.639985	t	\N	\N	\N	\N
82	Loose T Shirt With Pocket Imitation	Magni corporis iste quas nihil nisi rem doloremque aliquid. Ea fuga quaerat eaque accusamus similique. Eius ea delectus quod reprehenderit explicabo earum ullam voluptas. Mollitia dolorum libero perferendis facilis tempore iusto.	2022-07-12 18:13:47.92671	\N	loose-t-shirt-with-pocket-imitation	\N	\N	1	1	2022-07-12 18:13:48.029968	2022-07-12 18:15:47.824109	t	\N	\N	\N	\N
24	Long Sleeve Sweatshirt	Reprehenderit nulla adipisci voluptatibus eum. Modi ullam cupiditate alias adipisci enim doloremque nam. Assumenda voluptate optio provident laborum voluptatibus totam.	2022-07-12 18:13:25.361399	\N	long-sleeve-sweatshirt	\N	\N	1	1	2022-07-12 18:13:25.468421	2022-07-12 18:15:37.706004	t	\N	\N	\N	\N
28	Suede Biker Jacket	Illo nemo a ipsum odit incidunt sapiente. Quasi tenetur unde tempora nihil ullam. Reiciendis cum architecto suscipit nostrum. Sint voluptate cupiditate rem temporibus quasi aliquam accusantium. Voluptates ullam excepturi voluptatem ad enim.	2022-07-12 18:13:26.906223	\N	suede-biker-jacket	\N	\N	1	1	2022-07-12 18:13:27.057238	2022-07-12 18:15:38.310288	t	\N	\N	\N	\N
23	Jumper	Voluptatibus iste aspernatur sunt quos earum amet. Facilis officia pariatur quis voluptates neque. Laborum esse adipisci omnis impedit.	2022-07-12 18:13:24.997166	\N	jumper	\N	\N	1	1	2022-07-12 18:13:25.105046	2022-07-12 18:15:37.570001	t	\N	\N	\N	\N
34	Wool Blend Coat	Occaecati ea cum saepe dolore minus hic. Earum consectetur facere labore possimus est numquam commodi ea. Ad adipisci quidem corporis a at. Sint hic molestias temporibus recusandae debitis.	2022-07-12 18:13:29.458783	\N	wool-blend-coat	\N	\N	1	1	2022-07-12 18:13:29.567693	2022-07-12 18:15:39.607339	t	\N	\N	\N	\N
41	Flared Skirt	Porro neque illum corrupti veritatis ducimus doloribus. Placeat beatae molestias quas earum voluptates modi molestiae reprehenderit. Exercitationem unde odio architecto deleniti vitae ipsa omnis nemo. Ratione pariatur rem molestiae ab animi occaecati error. Iure vitae deleniti consequuntur neque error.	2022-07-12 18:13:31.998	\N	flared-skirt	\N	\N	1	1	2022-07-12 18:13:32.106511	2022-07-12 18:15:40.776934	t	\N	\N	\N	\N
12	Polo T Shirt	Sed enim ut molestiae nisi impedit. Quibusdam commodi doloremque officiis tempore. Fugiat itaque suscipit eligendi rerum quas ut quaerat optio.	2022-07-12 18:13:21.006743	\N	polo-t-shirt	\N	\N	1	1	2022-07-12 18:13:21.109783	2022-07-12 18:15:35.954019	t	\N	\N	\N	\N
31	Denim Jacket	Omnis totam modi id quia atque quas. Quae ipsa quia nobis suscipit. Autem ut voluptatum quo vel occaecati. Laboriosam voluptatum at aut deleniti minima debitis. Beatae voluptates laborum inventore quibusdam.	2022-07-12 18:13:28.207573	\N	denim-jacket	\N	\N	1	1	2022-07-12 18:13:28.320011	2022-07-12 18:15:38.998858	t	\N	\N	\N	\N
35	Jacket With Liner	Animi quibusdam alias laborum adipisci quae. Eos rem quo adipisci nesciunt veritatis ad. Eius soluta ad eligendi magnam cumque repellendus eos. Officia quo rem deleniti provident. Enim aut voluptatum deleniti modi.	2022-07-12 18:13:29.807567	\N	jacket-with-liner	\N	\N	1	1	2022-07-12 18:13:29.935552	2022-07-12 18:15:39.778462	t	\N	\N	\N	\N
33	Down Jacket With Hood	Maiores provident optio tempore inventore officiis. Repellendus quisquam sit recusandae sequi. Quaerat in porro provident ratione asperiores. Maxime vitae beatae doloremque magnam aliquid.	2022-07-12 18:13:29.092483	\N	down-jacket-with-hood	\N	\N	1	1	2022-07-12 18:13:29.206958	2022-07-12 18:15:39.33255	t	\N	\N	\N	\N
37	Midi Skirt With Bottoms	Qui debitis nobis minima occaecati voluptatum dicta. Autem recusandae error doloribus illo laborum mollitia eligendi. Porro vero impedit ducimus numquam dicta atque. Accusantium maiores odio minus mollitia iusto natus expedita. Qui ducimus ipsam impedit tempora assumenda enim.	2022-07-12 18:13:30.546701	\N	midi-skirt-with-bottoms	\N	\N	1	1	2022-07-12 18:13:30.658555	2022-07-12 18:15:40.103618	t	\N	\N	\N	\N
40	Leather Skirt With Lacing	Officia nulla corrupti explicabo eius totam quam. Minima alias consectetur exercitationem iste expedita fugiat vitae accusantium. Qui nesciunt ea fugiat autem illum dignissimos culpa tenetur. Id ea suscipit maiores consequatur beatae.	2022-07-12 18:13:31.643288	\N	leather-skirt-with-lacing	\N	\N	1	1	2022-07-12 18:13:31.751738	2022-07-12 18:15:40.604808	t	\N	\N	\N	\N
25	Hoodie	Commodi soluta suscipit cumque neque. Voluptatem consectetur qui voluptates libero. Quibusdam omnis ad voluptates voluptatibus maxime. Unde minus optio tenetur vero accusantium eius itaque. Labore dolore hic ipsum quo accusamus quidem.	2022-07-12 18:13:25.701521	\N	hoodie	\N	\N	1	1	2022-07-12 18:13:25.822753	2022-07-12 18:15:37.841894	t	\N	\N	\N	\N
26	Zipped High Neck Sweater	Labore optio tempora nobis nemo officiis ipsam. Cupiditate assumenda maiores cumque totam reiciendis voluptate illum aspernatur. Numquam reprehenderit architecto repellat rem consequatur nemo illo. Esse voluptatum occaecati quas animi tempore iure. Maxime dolore error laboriosam quae.	2022-07-12 18:13:26.14777	\N	zipped-high-neck-sweater	\N	\N	1	1	2022-07-12 18:13:26.262199	2022-07-12 18:15:37.985838	t	\N	\N	\N	\N
77	Printed T Shirt	Sapiente culpa non dignissimos maxime magnam. Perspiciatis voluptas facere veniam deserunt possimus magni omnis iure. Enim ratione cupiditate aliquid adipisci perferendis consequuntur harum. Voluptatibus dolore inventore suscipit odio exercitationem quis dolor corrupti. Aspernatur libero voluptatibus totam nisi.	2022-07-12 18:13:45.606079	\N	printed-t-shirt	\N	\N	1	1	2022-07-12 18:13:45.721758	2022-07-12 18:15:46.994613	t	\N	\N	\N	\N
78	Scrappy Top	Temporibus repellendus dolore autem unde nobis. Doloribus iure distinctio tempore alias molestias. Officia tenetur maiores possimus totam pariatur repellat consequuntur.	2022-07-12 18:13:46.3407	\N	scrappy-top	\N	\N	1	1	2022-07-12 18:13:46.48078	2022-07-12 18:15:47.200429	t	\N	\N	\N	\N
81	Crop Top	Est sint similique explicabo aperiam aliquam mollitia id. Aliquam unde error doloribus nostrum mollitia consequatur. Excepturi quidem voluptate ullam ex molestiae. Quidem dicta ab debitis blanditiis vitae repellat laborum. Facere ad minima quisquam at illum.	2022-07-12 18:13:47.567897	\N	crop-top	\N	\N	1	1	2022-07-12 18:13:47.680797	2022-07-12 18:15:47.670937	t	\N	\N	\N	\N
16	Raw Edge T Shirt	Facere officia laborum dolores animi autem tempora dolore. Suscipit sapiente dolores eaque fugiat ipsa asperiores. Animi eaque nesciunt voluptate dignissimos voluptates. Perferendis sequi suscipit rem officia quibusdam ut harum.	2022-07-12 18:13:22.376547	\N	raw-edge-t-shirt	\N	\N	1	1	2022-07-12 18:13:22.484648	2022-07-12 18:15:36.585715	t	\N	\N	\N	\N
59	Striped Shirt	Maiores asperiores expedita incidunt eos ex. Minus sunt voluptatum rem inventore unde eius. Occaecati excepturi incidunt id debitis quasi placeat.	2022-07-12 18:13:38.717982	\N	striped-shirt	\N	\N	1	1	2022-07-12 18:13:38.831243	2022-07-12 18:15:44.010545	t	\N	\N	\N	\N
64	Blouse With Wide Flounced Sleeve	Laboriosam qui quam magnam quidem aspernatur ex amet nostrum. Similique placeat ducimus incidunt illum maiores mollitia explicabo velit. Eligendi aliquid consectetur odio aperiam.	2022-07-12 18:13:40.602194	\N	blouse-with-wide-flounced-sleeve	\N	\N	1	1	2022-07-12 18:13:40.709149	2022-07-12 18:15:44.665624	t	\N	\N	\N	\N
44	Floral Flared Skirt	Earum consequatur ex ratione commodi voluptatem nesciunt minima aperiam. Incidunt provident impedit dolores dignissimos. Magnam hic nesciunt exercitationem aliquam.	2022-07-12 18:13:33.085572	\N	floral-flared-skirt	\N	\N	1	1	2022-07-12 18:13:33.201797	2022-07-12 18:15:41.219973	t	\N	\N	\N	\N
57	Slit Maxi Dress	Veniam eaque iste incidunt omnis. Numquam totam tempore voluptates possimus quibusdam corrupti expedita magni. Eos numquam natus exercitationem ut. Velit odit facere dolorum maiores suscipit laudantium quisquam. Corrupti velit sunt vel repellendus a ipsum tempore illo.	2022-07-12 18:13:38.022248	\N	slit-maxi-dress	\N	\N	1	1	2022-07-12 18:13:38.132993	2022-07-12 18:15:43.403009	t	\N	\N	\N	\N
63	Cotton Shirt	Vitae quisquam incidunt aut rem. Repudiandae quibusdam maiores doloremque dolorum facere quae. Labore corrupti delectus necessitatibus et veritatis quae explicabo.	2022-07-12 18:13:40.257348	\N	cotton-shirt	\N	\N	1	1	2022-07-12 18:13:40.3615	2022-07-12 18:15:44.511995	t	\N	\N	\N	\N
50	Long Sleeve Knitted Dress	Vitae delectus voluptates ab quisquam ipsum impedit. Occaecati eaque aperiam officia assumenda cum modi. Sed quod consequatur ipsam iure aspernatur.	2022-07-12 18:13:35.44638	\N	long-sleeve-knitted-dress	\N	\N	1	1	2022-07-12 18:13:35.557525	2022-07-12 18:15:42.224873	t	\N	\N	\N	\N
53	Printed Slit Sleeves Dress	Ea ut distinctio odit repudiandae. Dicta placeat dolores illum esse. Architecto vel illum reiciendis totam ipsam amet repudiandae aperiam.	2022-07-12 18:13:36.560719	\N	printed-slit-sleeves-dress	\N	\N	1	1	2022-07-12 18:13:36.671818	2022-07-12 18:15:42.704602	t	\N	\N	\N	\N
49	Elegant Flared Dress	Iure aliquid perferendis rerum dignissimos. Ea expedita dolorum aut nihil corporis nesciunt. Dicta harum soluta corporis perspiciatis hic eum. Ex corporis consequuntur accusantium qui.	2022-07-12 18:13:35.08712	\N	elegant-flared-dress	\N	\N	1	1	2022-07-12 18:13:35.202274	2022-07-12 18:15:42.039709	t	\N	\N	\N	\N
52	Printed Dress	Exercitationem tempore saepe dicta aliquid atque facilis debitis. Expedita assumenda itaque non nulla quas. Repellat est ipsum at qui ex odio. Tempora quidem quas unde optio. Voluptas maiores eos totam quas.	2022-07-12 18:13:36.187544	\N	printed-dress	\N	\N	1	1	2022-07-12 18:13:36.305061	2022-07-12 18:15:42.54469	t	\N	\N	\N	\N
61	Printed Wrapped Blouse	Sapiente amet laudantium recusandae ratione illo. Sit id vero aliquid accusamus earum. Facilis autem nobis perspiciatis consectetur nesciunt vero illo corporis.	2022-07-12 18:13:39.562815	\N	printed-wrapped-blouse	\N	\N	1	1	2022-07-12 18:13:39.674399	2022-07-12 18:15:44.367352	t	\N	\N	\N	\N
56	Flounced Dress	Fugit magnam odit nesciunt atque dolores saepe recusandae vero. Ipsa excepturi pariatur nisi rerum debitis. Temporibus quas rerum dolore perspiciatis iusto officia fugit. Nesciunt sapiente harum laboriosam impedit neque.	2022-07-12 18:13:37.669025	\N	flounced-dress	\N	\N	1	1	2022-07-12 18:13:37.775932	2022-07-12 18:15:43.23117	t	\N	\N	\N	\N
58	Semi Sheer Shirt With Floral Cuffs	Eos quia perspiciatis nulla id qui deleniti maxime. Quisquam est ea esse ab. Atque excepturi culpa similique commodi. Sequi pariatur qui voluptatibus delectus ea corrupti cupiditate perferendis. Distinctio mollitia ad deserunt excepturi dolorum adipisci nulla.	2022-07-12 18:13:38.37956	\N	semi-sheer-shirt-with-floral-cuffs	\N	\N	1	1	2022-07-12 18:13:38.486672	2022-07-12 18:15:43.666999	t	\N	\N	\N	\N
60	V Neck Wide Shirt	Mollitia quo omnis sequi reiciendis. Recusandae tempore deserunt harum occaecati reprehenderit vero voluptatibus. Molestiae magni voluptatum amet tenetur vel. Veritatis adipisci iusto excepturi dolorem sed ab. Maxime facilis recusandae repudiandae illo alias laudantium.	2022-07-12 18:13:39.067867	\N	v-neck-wide-shirt	\N	\N	1	1	2022-07-12 18:13:39.316362	2022-07-12 18:15:44.220018	t	\N	\N	\N	\N
68	V Neck Shirt	Voluptate atque voluptatibus culpa vitae. Atque aliquam nemo a repellat. Iste laboriosam in maxime libero atque. Facilis molestiae optio sed ducimus vel nobis et. Adipisci vel nisi possimus autem aliquam veritatis molestias quo.	2022-07-12 18:13:42.045267	\N	v-neck-shirt	\N	\N	1	1	2022-07-12 18:13:42.165262	2022-07-12 18:15:45.288755	t	\N	\N	\N	\N
85	Coat With Pockets	Similique repellendus laborum repudiandae explicabo fugit facilis. Blanditiis cum ullam magnam quidem aliquam. Deserunt laudantium consequuntur nihil repellendus quasi sint ut.	2022-07-12 18:13:49.047532	\N	coat-with-pockets	\N	\N	1	1	2022-07-12 18:13:49.162968	2022-07-12 18:15:48.2895	t	\N	\N	\N	\N
62	Pleated Sleeve V Neck Shirt	Hic at nulla omnis saepe placeat aliquam minus. Quae dolorum mollitia itaque aliquam accusantium corrupti. Ipsum iste nesciunt cum maxime animi ab maiores ex. Repudiandae ipsa laboriosam voluptates rem doloremque.	2022-07-12 18:13:39.918405	\N	pleated-sleeve-v-neck-shirt	\N	\N	1	1	2022-07-12 18:13:40.027365	2022-07-12 18:15:33.027826	t	\N	\N	\N	\N
18	Tank Top	Tempora ipsam aliquid inventore provident dolor. Exercitationem ex magnam dolorem perferendis nemo architecto saepe. Provident quis occaecati asperiores dolorem nemo.	2022-07-12 18:13:23.209425	\N	tank-top	\N	\N	1	1	2022-07-12 18:13:23.317573	2022-07-12 18:15:36.862186	t	\N	\N	\N	\N
66	Floral Shirt	Sed adipisci possimus quo impedit exercitationem. Quod culpa praesentium iste eaque placeat similique. Occaecati est saepe delectus nisi unde quia adipisci laborum. Sapiente ipsum molestiae nulla voluptatibus fugiat quaerat eaque. Vel tenetur hic eveniet rem unde assumenda nisi.	2022-07-12 18:13:41.315705	\N	floral-shirt	\N	\N	1	1	2022-07-12 18:13:41.420627	2022-07-12 18:15:44.984975	t	\N	\N	\N	\N
73	Knitted High Neck Sweater	Sapiente animi eius dicta non quaerat dolorem ratione. Error laborum earum in necessitatibus facilis esse. Maiores rerum repudiandae asperiores cupiditate mollitia. Amet dicta beatae odio deserunt animi esse. Pariatur minus quam culpa distinctio vero.	2022-07-12 18:13:43.873073	\N	knitted-high-neck-sweater	\N	\N	1	1	2022-07-12 18:13:43.998569	2022-07-12 18:15:46.208705	t	\N	\N	\N	\N
75	Cropped Fitted Sweater	Vitae non repudiandae ipsam quia expedita hic numquam. Iste iure debitis dolorum sequi amet mollitia maxime. Veritatis laborum libero atque vitae doloribus doloremque error.	2022-07-12 18:13:44.81429	\N	cropped-fitted-sweater	\N	\N	1	1	2022-07-12 18:13:44.935521	2022-07-12 18:15:46.620015	t	\N	\N	\N	\N
76	Crop Top With Tie	Aut alias iste adipisci modi eos. Atque maiores dolorem error possimus ipsam. Commodi ipsa quo repudiandae autem.	2022-07-12 18:13:45.194571	\N	crop-top-with-tie	\N	\N	1	1	2022-07-12 18:13:45.312161	2022-07-12 18:15:46.83456	t	\N	\N	\N	\N
5	Short Sleeve Shirt	Inventore eaque ea debitis eius nostrum neque porro. Recusandae sequi totam neque dolorum. Ducimus corporis debitis officiis omnis.	2022-07-12 18:13:18.629763	\N	short-sleeve-shirt	\N	\N	1	1	2022-07-12 18:13:18.733675	2022-07-12 18:15:35.075708	t	\N	\N	\N	\N
13	Long Sleeve T Shirt	Nesciunt reprehenderit quia modi quae molestias odio deleniti consectetur. Veritatis perspiciatis dolore voluptas corrupti aut. Magni delectus at odio asperiores quidem. Vel unde voluptas optio id possimus impedit. Dicta consectetur ducimus placeat eum eos voluptatibus perspiciatis.	2022-07-12 18:13:21.337759	\N	long-sleeve-t-shirt	\N	\N	1	1	2022-07-12 18:13:21.447101	2022-07-12 18:15:36.105986	t	\N	\N	\N	\N
72	Oversized Sweatshirt	Cum eveniet impedit facilis necessitatibus. Iure odit nihil neque culpa nulla veritatis ad. Incidunt pariatur magni temporibus modi voluptatibus quos nemo laborum. Dolor ut fuga adipisci quam. Fugit laborum atque hic cum adipisci natus.	2022-07-12 18:13:43.516638	\N	oversized-sweatshirt	\N	\N	1	1	2022-07-12 18:13:43.625507	2022-07-12 18:15:46.010958	t	\N	\N	\N	\N
95	Denim Hooded Jacket	Ducimus beatae sit numquam excepturi natus minima. Aliquam provident vitae aperiam eos dicta occaecati. Impedit quam aspernatur assumenda fugit incidunt officiis. Quo inventore ipsum accusamus natus fugit. Dolores eligendi quos ipsam ab eaque asperiores similique vitae.	2022-07-12 18:13:53.188645	\N	denim-hooded-jacket	\N	\N	1	1	2022-07-12 18:13:53.29933	2022-07-12 18:15:49.845819	t	\N	\N	\N	\N
106	Lightweight Running Jacket	Atque enim soluta minima fugiat. Beatae itaque doloribus dignissimos possimus laudantium qui officiis. Ut quaerat quae esse harum nemo repellat sint. Tempore error ipsum omnis illum cumque. Officiis natus explicabo illo iure at distinctio minus.	2022-07-12 18:13:57.438296	\N	lightweight-running-jacket	\N	\N	1	1	2022-07-12 18:13:57.55469	2022-07-12 18:15:51.550174	t	\N	\N	\N	\N
88	Long Coat With Belt	Quo animi sequi nihil maiores quisquam beatae ipsum. Nesciunt rerum quidem nihil dolore eaque illum quae nulla. Dicta esse in iste tempora fugit et nisi beatae.	2022-07-12 18:13:50.154756	\N	long-coat-with-belt	\N	\N	1	1	2022-07-12 18:13:50.273003	2022-07-12 18:15:48.767838	t	\N	\N	\N	\N
102	Sports Bra Medium Support	Nulla aut dicta cum dolorum modi officiis. Quam suscipit voluptatem cumque dolorem et at itaque. Iusto ea id tempora fuga dolores expedita ducimus assumenda. Earum commodi ad provident assumenda reiciendis animi suscipit optio.	2022-07-12 18:13:55.742633	\N	sports-bra-medium-support	\N	\N	1	1	2022-07-12 18:13:55.848228	2022-07-12 18:15:50.940977	t	\N	\N	\N	\N
104	Sport Cropp Top	Eos veritatis magni error facilis. Expedita at deleniti repellat aliquid dolore. Quos libero fugiat corrupti voluptatibus doloremque alias repellat.	2022-07-12 18:13:56.660013	\N	sport-cropp-top	\N	\N	1	1	2022-07-12 18:13:56.812783	2022-07-12 18:15:51.237107	t	\N	\N	\N	\N
93	Leather Biker Jacket	Accusantium asperiores vitae quo nulla vel ab placeat. Voluptate repellat reprehenderit vitae voluptatem blanditiis magni. Inventore saepe minima fugiat dignissimos alias corrupti aperiam. In quidem minima ipsa et sed culpa. Consectetur eveniet amet beatae voluptates architecto sit minus possimus.	2022-07-12 18:13:52.434348	\N	leather-biker-jacket	\N	\N	1	1	2022-07-12 18:13:52.549667	2022-07-12 18:15:49.545073	t	\N	\N	\N	\N
101	Laced Crop Top	Vero rerum minima ab aliquid. Atque ab officiis perspiciatis distinctio dolore minus illo. Totam aperiam error accusantium voluptatibus consequatur. Repellat explicabo amet vel nesciunt ullam aliquid laborum itaque.	2022-07-12 18:13:55.387812	\N	laced-crop-top	\N	\N	1	1	2022-07-12 18:13:55.505438	2022-07-12 18:15:50.787012	t	\N	\N	\N	\N
91	Loose Fitted Jacket	Quasi nobis aperiam rem harum saepe unde similique. Repellat voluptatum quibusdam in dolorem. Numquam debitis fuga esse occaecati quaerat distinctio corrupti.	2022-07-12 18:13:51.564444	\N	loose-fitted-jacket	\N	\N	1	1	2022-07-12 18:13:51.687103	2022-07-12 18:15:49.238055	t	\N	\N	\N	\N
98	Long Sleeves Yoga Crop Top	Sit dolores placeat possimus fugit eius. Libero deserunt perspiciatis similique cumque doloremque quae. Ab perferendis ducimus iste nam quisquam.	2022-07-12 18:13:54.337359	\N	long-sleeves-yoga-crop-top	\N	\N	1	1	2022-07-12 18:13:54.447803	2022-07-12 18:15:50.315757	t	\N	\N	\N	\N
99	Oversize T Shirt Wrapped On Back	Facere provident praesentium inventore modi veritatis. Nam numquam veritatis quae non optio aperiam quisquam. Totam ab vero rerum aut. Magni amet sed praesentium voluptatem impedit nostrum alias.	2022-07-12 18:13:54.692243	\N	oversize-t-shirt-wrapped-on-back	\N	\N	1	1	2022-07-12 18:13:54.802491	2022-07-12 18:15:50.466512	t	\N	\N	\N	\N
100	Long Sleeves Crop Top	Nobis deleniti corporis modi molestiae atque error. Beatae architecto corrupti voluptate repudiandae qui ullam. Sint nesciunt sed vel ab. Temporibus id tempore iste iusto. Rerum commodi quidem dolorum esse eaque vitae delectus.	2022-07-12 18:13:55.035514	\N	long-sleeves-crop-top	\N	\N	1	1	2022-07-12 18:13:55.156868	2022-07-12 18:15:50.618692	t	\N	\N	\N	\N
103	Sports Bra 	Ipsum magnam animi voluptatum ratione rerum eius nobis. Amet eos dolores facere aspernatur architecto. Dolorum occaecati quam impedit placeat laboriosam labore repudiandae pariatur. Quod consequatur expedita numquam repellat animi tempora.	2022-07-12 18:13:56.194397	\N	sports-bra	\N	\N	1	1	2022-07-12 18:13:56.31494	2022-07-12 18:15:51.093042	t	\N	\N	\N	\N
15	T Shirt With Holes	Placeat dolores ducimus molestias animi. Quibusdam vitae necessitatibus earum corrupti exercitationem adipisci deserunt. Quisquam distinctio fuga qui nulla atque. Cumque quaerat ullam quia vel suscipit. Dolores magnam quae eos unde mollitia.	2022-07-12 18:13:22.022377	\N	t-shirt-with-holes	\N	\N	1	1	2022-07-12 18:13:22.128963	2022-07-12 18:15:36.440833	t	\N	\N	\N	\N
116	High Waist Pants	Atque fuga dolore ipsam a culpa adipisci quia. Ab magni temporibus optio deleniti. Distinctio consequatur impedit eaque similique.	2022-07-12 18:14:01.217208	\N	high-waist-pants	\N	\N	1	1	2022-07-12 18:14:01.322012	2022-07-12 18:15:52.461743	t	\N	\N	\N	\N
108	Sport Windproof Jacket	Officiis nulla similique eos tempora. Ab qui illo incidunt maiores vero possimus. Eos modi similique nemo doloribus voluptatibus quos molestias. Alias nihil sed doloremque molestias. Tenetur nisi temporibus quo magnam molestiae blanditiis.	2022-07-12 18:13:58.181169	\N	sport-windproof-jacket	\N	\N	1	1	2022-07-12 18:13:58.285334	2022-07-12 18:15:51.854809	t	\N	\N	\N	\N
109	Sport Waistcoat	Perferendis harum voluptas tempora dolore maiores deleniti. Cum praesentium omnis atque corporis. Ipsum nihil quod rerum neque beatae sed vel deleniti. Temporibus et ducimus exercitationem dolorum molestiae hic corporis rem.	2022-07-12 18:13:58.547108	\N	sport-waistcoat	\N	\N	1	1	2022-07-12 18:13:58.659922	2022-07-12 18:15:52.004624	t	\N	\N	\N	\N
112	Printed Pants With Holes	Repellat velit laborum omnis consequatur provident libero occaecati ut. Dolorum modi excepturi perferendis occaecati. Porro eveniet molestiae nobis accusamus.	2022-07-12 18:13:59.632949	\N	printed-pants-with-holes	\N	\N	1	1	2022-07-12 18:13:59.741963	2022-07-12 18:15:33.525081	t	\N	\N	\N	\N
114	Printed Pants	Molestiae laudantium quidem repellendus tenetur nesciunt. Nihil sunt incidunt perferendis porro dolorum nam odio earum. Deserunt consequuntur ab nostrum alias velit unde repellendus minima. Sequi eligendi quis cupiditate dolorem. Tenetur inventore nihil ab mollitia magni sint provident.	2022-07-12 18:14:00.474266	\N	printed-pants	\N	\N	1	1	2022-07-12 18:14:00.618412	2022-07-12 18:15:33.831171	t	\N	\N	\N	\N
111	Short Pants	Soluta explicabo quisquam rem accusantium illo laborum ratione incidunt. Aperiam ab impedit quasi nihil odit. Maxime mollitia facere at voluptate. Veniam soluta expedita adipisci maiores vitae minus repudiandae harum.	2022-07-12 18:13:59.279977	\N	short-pants	\N	\N	1	1	2022-07-12 18:13:59.389341	2022-07-12 18:15:52.307836	t	\N	\N	\N	\N
113	Pants	Alias est molestias laudantium consequuntur in minus facere distinctio. Quae omnis natus accusamus unde ducimus. Perspiciatis quas quos blanditiis tempora soluta quam molestias minima. Quod vitae necessitatibus aut voluptatibus repellendus quidem. Atque facere amet harum voluptates.	2022-07-12 18:14:00.036039	\N	pants	\N	\N	1	1	2022-07-12 18:14:00.171791	2022-07-12 18:15:33.687584	t	\N	\N	\N	\N
115	High Waist Pants With Pockets	Quasi voluptates quo molestias nulla perferendis consequatur repellat. Voluptates enim odit libero repellendus officiis laboriosam. Iure soluta adipisci dignissimos amet eveniet.	2022-07-12 18:14:00.867015	\N	high-waist-pants-with-pockets	\N	\N	1	1	2022-07-12 18:14:00.972025	2022-07-12 18:15:34.015524	t	\N	\N	\N	\N
38	Fitted Skirt	Amet ducimus voluptatum omnis praesentium repellat illum atque nulla. Autem praesentium consequuntur illo aperiam eos facere distinctio. Maxime quisquam maiores earum error quis temporibus.	2022-07-12 18:13:30.906301	\N	fitted-skirt	\N	\N	1	1	2022-07-12 18:13:31.026289	2022-07-12 18:15:40.2678	t	\N	\N	\N	\N
94	Wool Blend Coat With Belt	Mollitia facere eveniet quia numquam. Illum odio adipisci corporis sint deleniti itaque. Minus quaerat sed tempora nobis. Rerum suscipit sit corporis repellat voluptates ad.	2022-07-12 18:13:52.793484	\N	wool-blend-coat-with-belt	\N	\N	1	1	2022-07-12 18:13:52.943398	2022-07-12 18:15:49.696379	t	\N	\N	\N	\N
10	Linen Shirt	Eveniet asperiores tenetur repellat placeat modi ab veritatis excepturi. Cupiditate recusandae sit quibusdam modi labore. Distinctio a ex beatae ipsa illum exercitationem nesciunt molestiae. Sed ipsa sapiente amet provident voluptate veniam.	2022-07-12 18:13:20.332429	\N	linen-shirt	\N	\N	1	1	2022-07-12 18:13:20.438071	2022-07-12 18:15:35.80649	t	\N	\N	\N	\N
105	Running Sweatshirt	Excepturi inventore deserunt delectus dicta a. Voluptates ipsam eligendi accusantium illo quasi vel optio quibusdam. Deleniti iste facilis voluptatibus molestiae autem mollitia quisquam. Qui quam ut vitae dolores atque doloribus dicta.	2022-07-12 18:13:57.047807	\N	running-sweatshirt	\N	\N	1	1	2022-07-12 18:13:57.165606	2022-07-12 18:15:51.392942	t	\N	\N	\N	\N
7	Regular Shirt	Aperiam autem amet nam laudantium quidem. Fuga consequatur voluptas qui voluptatem consectetur doloribus. Quas veritatis exercitationem excepturi consequatur aut quibusdam.	2022-07-12 18:13:19.30322	\N	regular-shirt	\N	\N	1	1	2022-07-12 18:13:19.407093	2022-07-12 18:15:35.371393	t	\N	\N	\N	\N
79	Pleated Sleeve T Shirt	Ea nulla eligendi dolorem magni. Occaecati quidem fugit maxime fuga debitis excepturi. Odio ipsa porro doloribus ea nostrum nobis quas necessitatibus. Voluptatum natus perspiciatis dicta sint repudiandae tempora. Eveniet non sequi necessitatibus amet ipsum consequatur adipisci.	2022-07-12 18:13:46.815179	\N	pleated-sleeve-t-shirt	\N	\N	1	1	2022-07-12 18:13:46.928259	2022-07-12 18:15:47.35757	t	\N	\N	\N	\N
17	V Neck T Shirt	Eveniet molestiae enim illum placeat recusandae. Distinctio praesentium nobis explicabo excepturi velit aspernatur. Incidunt eum aliquam vitae eveniet voluptate.	2022-07-12 18:13:22.719738	\N	v-neck-t-shirt	\N	\N	1	1	2022-07-12 18:13:22.972608	2022-07-12 18:15:36.725872	t	\N	\N	\N	\N
19	Basic T Shirt	Eligendi pariatur odit expedita labore. Sequi iste exercitationem repellendus expedita quam perspiciatis in fugit. Repellat sint iste hic tempore distinctio veritatis. In neque tenetur praesentium quidem deserunt laborum. Libero corporis recusandae cupiditate praesentium odio vero.	2022-07-12 18:13:23.566031	\N	basic-t-shirt	\N	\N	1	1	2022-07-12 18:13:23.677212	2022-07-12 18:15:37.001386	t	\N	\N	\N	\N
69	Printed Shirt	Placeat eius harum facere aut. Earum quisquam sequi eaque ipsa modi. Sint quas incidunt nulla possimus facilis hic. Esse id ullam voluptas in reprehenderit quaerat corporis numquam. Hic dolores doloribus id excepturi dolore neque.	2022-07-12 18:13:42.426889	\N	printed-shirt	\N	\N	1	1	2022-07-12 18:13:42.55227	2022-07-12 18:15:45.444354	t	\N	\N	\N	\N
70	Asymmetric Sweater With Wide Sleeves	Ab ad facilis ipsam reprehenderit ex ipsum. Quos nisi nobis itaque fugit minus modi nostrum. Eius perspiciatis mollitia veniam saepe voluptatibus.	2022-07-12 18:13:42.81728	\N	asymmetric-sweater-with-wide-sleeves	\N	\N	1	1	2022-07-12 18:13:42.927495	2022-07-12 18:15:45.600667	t	\N	\N	\N	\N
89	Down Jacket	Molestiae soluta veniam illo alias voluptatum minima accusamus. Ea corporis dolores autem dolorem vitae qui id ut. Nesciunt autem voluptatibus asperiores ab facilis quam porro iusto. Asperiores blanditiis architecto non placeat corrupti excepturi consequuntur. Eius repudiandae aperiam dicta delectus.	2022-07-12 18:13:50.546399	\N	down-jacket	\N	\N	1	1	2022-07-12 18:13:50.722652	2022-07-12 18:15:48.913628	t	\N	\N	\N	\N
30	Anorak With Hood	Laboriosam magni debitis inventore recusandae atque libero. Perferendis praesentium soluta odio exercitationem quis vel veniam asperiores. Cumque earum a facilis nam sunt quod. Sunt unde ratione natus officiis nam quaerat enim beatae.	2022-07-12 18:13:27.742848	\N	anorak-with-hood	\N	\N	1	1	2022-07-12 18:13:27.857596	2022-07-12 18:15:38.837267	t	\N	\N	\N	\N
48	Flared Dress	Perferendis id labore dolore corporis exercitationem quas. Doloremque consequuntur architecto exercitationem iusto. Quasi voluptatibus quae aperiam velit nisi. Commodi perferendis tempora magni neque. Minima nesciunt qui aliquam voluptatibus facilis aut quis.	2022-07-12 18:13:34.73343	\N	flared-dress	\N	\N	1	1	2022-07-12 18:13:34.84675	2022-07-12 18:15:41.874907	t	\N	\N	\N	\N
11	Regular Shirt With Rolled Up Sleeves	Ducimus quas et dignissimos cupiditate. Itaque laboriosam cum repudiandae facere quod soluta aspernatur. Reprehenderit numquam beatae velit delectus iusto. Unde nostrum modi provident incidunt.	2022-07-12 18:13:20.677467	\N	regular-shirt-with-rolled-up-sleeves	\N	\N	1	1	2022-07-12 18:13:20.776635	2022-07-12 18:15:32.87141	t	\N	\N	\N	\N
65	Elegant Blouse With Chocker	Tempore unde quibusdam eaque et similique incidunt. In nostrum asperiores voluptates at soluta hic perspiciatis cum. Non nobis reiciendis possimus enim cumque. Velit voluptatum sed omnis veritatis aliquid ipsam.	2022-07-12 18:13:40.937892	\N	elegant-blouse-with-chocker	\N	\N	1	1	2022-07-12 18:13:41.049032	2022-07-12 18:15:44.836657	t	\N	\N	\N	\N
86	Long Wool Blend Coat With Belt	Quidem ratione explicabo delectus nesciunt. Iusto provident atque id voluptatem debitis nihil. Fugit exercitationem tempore provident molestias distinctio quia impedit. Voluptatibus natus nesciunt adipisci qui quasi voluptatum eius harum.	2022-07-12 18:13:49.417552	\N	long-wool-blend-coat-with-belt	\N	\N	1	1	2022-07-12 18:13:49.525501	2022-07-12 18:15:48.44332	t	\N	\N	\N	\N
97	Sports Bra Low Support	Illum impedit quisquam atque cupiditate velit veniam nisi. Expedita ad quod quasi aperiam corporis repellendus. A dolore tenetur laborum sapiente animi atque. Aliquam praesentium perferendis tempora perspiciatis occaecati. Rerum illo pariatur officia consequuntur at.	2022-07-12 18:13:53.985874	\N	sports-bra-low-support	\N	\N	1	1	2022-07-12 18:13:54.100351	2022-07-12 18:15:50.150089	t	\N	\N	\N	\N
110	Shined Pants	Incidunt illo molestias eveniet dicta neque veritatis illum fugit. Doloribus consequatur dolorem est ipsa culpa. Dicta modi quo sunt blanditiis omnis magni itaque. Pariatur ipsa minima libero quis dolorum ipsum beatae.	2022-07-12 18:13:58.925767	\N	shined-pants	\N	\N	1	1	2022-07-12 18:13:59.030752	2022-07-12 18:15:52.150009	t	\N	\N	\N	\N
20	High Neck Sweater	Ducimus aperiam maiores doloribus laborum nemo. Fugiat voluptates vero quibusdam beatae quidem voluptatem alias. Ab quisquam labore cum nemo alias eligendi hic provident. Laudantium placeat exercitationem nulla fugiat.	2022-07-12 18:13:23.932558	\N	high-neck-sweater	\N	\N	1	1	2022-07-12 18:13:24.047159	2022-07-12 18:15:37.138355	t	\N	\N	\N	\N
39	A Line Suede Skirt	Autem perferendis harum vel similique. Eaque quisquam perspiciatis laborum id eius veniam. Magni dicta at nostrum perferendis. Pariatur itaque quam voluptatem consequuntur alias id sint.	2022-07-12 18:13:31.276388	\N	a-line-suede-skirt	\N	\N	1	1	2022-07-12 18:13:31.391121	2022-07-12 18:15:40.439331	t	\N	\N	\N	\N
84	Basic Loose T Shirt	Accusamus perferendis cumque quod natus voluptates quos optio dolores. Odit reiciendis sapiente dignissimos voluptas molestiae repellendus minus. Sed praesentium aspernatur illo doloremque. Et vitae quidem delectus reiciendis. Expedita amet laboriosam cumque saepe eum rem.	2022-07-12 18:13:48.653251	\N	basic-loose-t-shirt	\N	\N	1	1	2022-07-12 18:13:48.787394	2022-07-12 18:15:48.137469	t	\N	\N	\N	\N
32	Wool Blend Short Coat	At magni quas deleniti tenetur. Eum iusto molestias voluptas cum sed magni ducimus. Praesentium aliquid non necessitatibus autem repudiandae atque delectus eligendi. Laudantium molestias enim nobis illo quae natus explicabo. Inventore occaecati sunt dicta quaerat nisi dolor.	2022-07-12 18:13:28.723377	\N	wool-blend-short-coat	\N	\N	1	1	2022-07-12 18:13:28.834877	2022-07-12 18:15:39.169735	t	\N	\N	\N	\N
55	V Neck Floral Dress	Delectus ducimus eligendi tempora quos vero cumque. Eligendi placeat perferendis maxime neque minima. Velit aliquid voluptate ex quidem voluptas in iure odio. Cum quia quos fugit harum exercitationem. Facere suscipit dolore quia sed et illo at deserunt.	2022-07-12 18:13:37.282987	\N	v-neck-floral-dress	\N	\N	1	1	2022-07-12 18:13:37.398664	2022-07-12 18:15:43.030782	t	\N	\N	\N	\N
\.


--
-- Data for Name: spree_products_stores; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.spree_products_stores (id, product_id, store_id, created_at, updated_at) FROM stdin;
1	1	1	2022-07-12 18:13:17.310316	2022-07-12 18:13:17.310316
2	1	2	2022-07-12 18:13:17.316702	2022-07-12 18:13:17.316702
3	1	3	2022-07-12 18:13:17.322354	2022-07-12 18:13:17.322354
4	2	1	2022-07-12 18:13:17.784646	2022-07-12 18:13:17.784646
5	2	2	2022-07-12 18:13:17.790959	2022-07-12 18:13:17.790959
6	2	3	2022-07-12 18:13:17.796506	2022-07-12 18:13:17.796506
7	3	1	2022-07-12 18:13:18.128786	2022-07-12 18:13:18.128786
8	3	2	2022-07-12 18:13:18.135631	2022-07-12 18:13:18.135631
9	3	3	2022-07-12 18:13:18.141454	2022-07-12 18:13:18.141454
10	4	1	2022-07-12 18:13:18.46825	2022-07-12 18:13:18.46825
11	4	2	2022-07-12 18:13:18.473954	2022-07-12 18:13:18.473954
12	4	3	2022-07-12 18:13:18.479651	2022-07-12 18:13:18.479651
13	5	1	2022-07-12 18:13:18.796834	2022-07-12 18:13:18.796834
14	5	2	2022-07-12 18:13:18.802695	2022-07-12 18:13:18.802695
15	5	3	2022-07-12 18:13:18.808737	2022-07-12 18:13:18.808737
16	6	1	2022-07-12 18:13:19.142255	2022-07-12 18:13:19.142255
17	6	2	2022-07-12 18:13:19.148573	2022-07-12 18:13:19.148573
18	6	3	2022-07-12 18:13:19.154427	2022-07-12 18:13:19.154427
19	7	1	2022-07-12 18:13:19.48072	2022-07-12 18:13:19.48072
20	7	2	2022-07-12 18:13:19.48687	2022-07-12 18:13:19.48687
21	7	3	2022-07-12 18:13:19.493185	2022-07-12 18:13:19.493185
22	8	1	2022-07-12 18:13:19.81796	2022-07-12 18:13:19.81796
23	8	2	2022-07-12 18:13:19.823828	2022-07-12 18:13:19.823828
24	8	3	2022-07-12 18:13:19.829981	2022-07-12 18:13:19.829981
25	9	1	2022-07-12 18:13:20.165516	2022-07-12 18:13:20.165516
26	9	2	2022-07-12 18:13:20.171644	2022-07-12 18:13:20.171644
27	9	3	2022-07-12 18:13:20.177652	2022-07-12 18:13:20.177652
28	10	1	2022-07-12 18:13:20.511997	2022-07-12 18:13:20.511997
29	10	2	2022-07-12 18:13:20.518128	2022-07-12 18:13:20.518128
30	10	3	2022-07-12 18:13:20.524043	2022-07-12 18:13:20.524043
31	11	1	2022-07-12 18:13:20.839969	2022-07-12 18:13:20.839969
32	11	2	2022-07-12 18:13:20.845785	2022-07-12 18:13:20.845785
33	11	3	2022-07-12 18:13:20.851819	2022-07-12 18:13:20.851819
34	12	1	2022-07-12 18:13:21.174726	2022-07-12 18:13:21.174726
35	12	2	2022-07-12 18:13:21.180923	2022-07-12 18:13:21.180923
36	12	3	2022-07-12 18:13:21.186399	2022-07-12 18:13:21.186399
37	13	1	2022-07-12 18:13:21.510996	2022-07-12 18:13:21.510996
38	13	2	2022-07-12 18:13:21.517176	2022-07-12 18:13:21.517176
39	13	3	2022-07-12 18:13:21.522711	2022-07-12 18:13:21.522711
40	14	1	2022-07-12 18:13:21.841853	2022-07-12 18:13:21.841853
41	14	2	2022-07-12 18:13:21.84833	2022-07-12 18:13:21.84833
42	14	3	2022-07-12 18:13:21.860431	2022-07-12 18:13:21.860431
43	15	1	2022-07-12 18:13:22.198649	2022-07-12 18:13:22.198649
44	15	2	2022-07-12 18:13:22.204852	2022-07-12 18:13:22.204852
45	15	3	2022-07-12 18:13:22.210877	2022-07-12 18:13:22.210877
46	16	1	2022-07-12 18:13:22.55177	2022-07-12 18:13:22.55177
47	16	2	2022-07-12 18:13:22.557306	2022-07-12 18:13:22.557306
48	16	3	2022-07-12 18:13:22.563251	2022-07-12 18:13:22.563251
49	17	1	2022-07-12 18:13:23.040633	2022-07-12 18:13:23.040633
50	17	2	2022-07-12 18:13:23.046415	2022-07-12 18:13:23.046415
51	17	3	2022-07-12 18:13:23.052106	2022-07-12 18:13:23.052106
52	18	1	2022-07-12 18:13:23.387824	2022-07-12 18:13:23.387824
53	18	2	2022-07-12 18:13:23.393434	2022-07-12 18:13:23.393434
54	18	3	2022-07-12 18:13:23.399913	2022-07-12 18:13:23.399913
55	19	1	2022-07-12 18:13:23.745681	2022-07-12 18:13:23.745681
56	19	2	2022-07-12 18:13:23.752195	2022-07-12 18:13:23.752195
57	19	3	2022-07-12 18:13:23.75834	2022-07-12 18:13:23.75834
58	20	1	2022-07-12 18:13:24.121642	2022-07-12 18:13:24.121642
59	20	2	2022-07-12 18:13:24.127981	2022-07-12 18:13:24.127981
60	20	3	2022-07-12 18:13:24.135404	2022-07-12 18:13:24.135404
61	21	1	2022-07-12 18:13:24.474733	2022-07-12 18:13:24.474733
62	21	2	2022-07-12 18:13:24.481447	2022-07-12 18:13:24.481447
63	21	3	2022-07-12 18:13:24.487858	2022-07-12 18:13:24.487858
64	22	1	2022-07-12 18:13:24.833991	2022-07-12 18:13:24.833991
65	22	2	2022-07-12 18:13:24.839888	2022-07-12 18:13:24.839888
66	22	3	2022-07-12 18:13:24.846406	2022-07-12 18:13:24.846406
67	23	1	2022-07-12 18:13:25.181981	2022-07-12 18:13:25.181981
68	23	2	2022-07-12 18:13:25.188229	2022-07-12 18:13:25.188229
69	23	3	2022-07-12 18:13:25.193859	2022-07-12 18:13:25.193859
70	24	1	2022-07-12 18:13:25.534579	2022-07-12 18:13:25.534579
71	24	2	2022-07-12 18:13:25.539993	2022-07-12 18:13:25.539993
72	24	3	2022-07-12 18:13:25.546235	2022-07-12 18:13:25.546235
73	25	1	2022-07-12 18:13:25.899947	2022-07-12 18:13:25.899947
74	25	2	2022-07-12 18:13:25.906612	2022-07-12 18:13:25.906612
75	25	3	2022-07-12 18:13:25.913536	2022-07-12 18:13:25.913536
76	26	1	2022-07-12 18:13:26.347235	2022-07-12 18:13:26.347235
77	26	2	2022-07-12 18:13:26.353899	2022-07-12 18:13:26.353899
78	26	3	2022-07-12 18:13:26.361376	2022-07-12 18:13:26.361376
79	27	1	2022-07-12 18:13:26.706026	2022-07-12 18:13:26.706026
80	27	2	2022-07-12 18:13:26.712252	2022-07-12 18:13:26.712252
81	27	3	2022-07-12 18:13:26.718644	2022-07-12 18:13:26.718644
82	28	1	2022-07-12 18:13:27.143972	2022-07-12 18:13:27.143972
83	28	2	2022-07-12 18:13:27.151014	2022-07-12 18:13:27.151014
84	28	3	2022-07-12 18:13:27.1587	2022-07-12 18:13:27.1587
85	29	1	2022-07-12 18:13:27.563502	2022-07-12 18:13:27.563502
86	29	2	2022-07-12 18:13:27.570298	2022-07-12 18:13:27.570298
87	29	3	2022-07-12 18:13:27.576575	2022-07-12 18:13:27.576575
88	30	1	2022-07-12 18:13:27.932548	2022-07-12 18:13:27.932548
89	30	2	2022-07-12 18:13:27.940794	2022-07-12 18:13:27.940794
90	30	3	2022-07-12 18:13:27.952595	2022-07-12 18:13:27.952595
91	31	1	2022-07-12 18:13:28.395544	2022-07-12 18:13:28.395544
92	31	2	2022-07-12 18:13:28.40198	2022-07-12 18:13:28.40198
93	31	3	2022-07-12 18:13:28.407804	2022-07-12 18:13:28.407804
94	32	1	2022-07-12 18:13:28.907919	2022-07-12 18:13:28.907919
95	32	2	2022-07-12 18:13:28.91444	2022-07-12 18:13:28.91444
96	32	3	2022-07-12 18:13:28.920461	2022-07-12 18:13:28.920461
97	33	1	2022-07-12 18:13:29.277752	2022-07-12 18:13:29.277752
98	33	2	2022-07-12 18:13:29.290271	2022-07-12 18:13:29.290271
99	33	3	2022-07-12 18:13:29.296626	2022-07-12 18:13:29.296626
100	34	1	2022-07-12 18:13:29.635609	2022-07-12 18:13:29.635609
101	34	2	2022-07-12 18:13:29.641978	2022-07-12 18:13:29.641978
102	34	3	2022-07-12 18:13:29.648659	2022-07-12 18:13:29.648659
103	35	1	2022-07-12 18:13:30.005009	2022-07-12 18:13:30.005009
104	35	2	2022-07-12 18:13:30.01119	2022-07-12 18:13:30.01119
105	35	3	2022-07-12 18:13:30.017514	2022-07-12 18:13:30.017514
106	36	1	2022-07-12 18:13:30.36826	2022-07-12 18:13:30.36826
107	36	2	2022-07-12 18:13:30.374248	2022-07-12 18:13:30.374248
108	36	3	2022-07-12 18:13:30.379926	2022-07-12 18:13:30.379926
109	37	1	2022-07-12 18:13:30.73493	2022-07-12 18:13:30.73493
110	37	2	2022-07-12 18:13:30.741859	2022-07-12 18:13:30.741859
111	37	3	2022-07-12 18:13:30.748063	2022-07-12 18:13:30.748063
112	38	1	2022-07-12 18:13:31.104296	2022-07-12 18:13:31.104296
113	38	2	2022-07-12 18:13:31.110312	2022-07-12 18:13:31.110312
114	38	3	2022-07-12 18:13:31.117477	2022-07-12 18:13:31.117477
115	39	1	2022-07-12 18:13:31.468574	2022-07-12 18:13:31.468574
116	39	2	2022-07-12 18:13:31.474373	2022-07-12 18:13:31.474373
117	39	3	2022-07-12 18:13:31.486526	2022-07-12 18:13:31.486526
118	40	1	2022-07-12 18:13:31.826322	2022-07-12 18:13:31.826322
119	40	2	2022-07-12 18:13:31.83229	2022-07-12 18:13:31.83229
120	40	3	2022-07-12 18:13:31.838119	2022-07-12 18:13:31.838119
121	41	1	2022-07-12 18:13:32.18286	2022-07-12 18:13:32.18286
122	41	2	2022-07-12 18:13:32.188826	2022-07-12 18:13:32.188826
123	41	3	2022-07-12 18:13:32.194539	2022-07-12 18:13:32.194539
124	42	1	2022-07-12 18:13:32.54752	2022-07-12 18:13:32.54752
125	42	2	2022-07-12 18:13:32.554003	2022-07-12 18:13:32.554003
126	42	3	2022-07-12 18:13:32.560238	2022-07-12 18:13:32.560238
127	43	1	2022-07-12 18:13:32.905748	2022-07-12 18:13:32.905748
128	43	2	2022-07-12 18:13:32.911224	2022-07-12 18:13:32.911224
129	43	3	2022-07-12 18:13:32.917356	2022-07-12 18:13:32.917356
130	44	1	2022-07-12 18:13:33.279924	2022-07-12 18:13:33.279924
131	44	2	2022-07-12 18:13:33.285991	2022-07-12 18:13:33.285991
132	44	3	2022-07-12 18:13:33.291941	2022-07-12 18:13:33.291941
133	45	1	2022-07-12 18:13:33.651669	2022-07-12 18:13:33.651669
134	45	2	2022-07-12 18:13:33.658273	2022-07-12 18:13:33.658273
135	45	3	2022-07-12 18:13:33.664388	2022-07-12 18:13:33.664388
136	46	1	2022-07-12 18:13:34.174354	2022-07-12 18:13:34.174354
137	46	2	2022-07-12 18:13:34.181103	2022-07-12 18:13:34.181103
138	46	3	2022-07-12 18:13:34.188291	2022-07-12 18:13:34.188291
139	47	1	2022-07-12 18:13:34.553389	2022-07-12 18:13:34.553389
140	47	2	2022-07-12 18:13:34.559641	2022-07-12 18:13:34.559641
141	47	3	2022-07-12 18:13:34.566073	2022-07-12 18:13:34.566073
142	48	1	2022-07-12 18:13:34.923528	2022-07-12 18:13:34.923528
143	48	2	2022-07-12 18:13:34.929431	2022-07-12 18:13:34.929431
144	48	3	2022-07-12 18:13:34.935364	2022-07-12 18:13:34.935364
145	49	1	2022-07-12 18:13:35.277249	2022-07-12 18:13:35.277249
146	49	2	2022-07-12 18:13:35.28385	2022-07-12 18:13:35.28385
147	49	3	2022-07-12 18:13:35.289078	2022-07-12 18:13:35.289078
148	50	1	2022-07-12 18:13:35.635883	2022-07-12 18:13:35.635883
149	50	2	2022-07-12 18:13:35.64191	2022-07-12 18:13:35.64191
150	50	3	2022-07-12 18:13:35.649261	2022-07-12 18:13:35.649261
151	51	1	2022-07-12 18:13:36.016609	2022-07-12 18:13:36.016609
152	51	2	2022-07-12 18:13:36.022392	2022-07-12 18:13:36.022392
153	51	3	2022-07-12 18:13:36.027959	2022-07-12 18:13:36.027959
154	52	1	2022-07-12 18:13:36.385707	2022-07-12 18:13:36.385707
155	52	2	2022-07-12 18:13:36.392364	2022-07-12 18:13:36.392364
156	52	3	2022-07-12 18:13:36.398539	2022-07-12 18:13:36.398539
157	53	1	2022-07-12 18:13:36.749183	2022-07-12 18:13:36.749183
158	53	2	2022-07-12 18:13:36.754907	2022-07-12 18:13:36.754907
159	53	3	2022-07-12 18:13:36.760849	2022-07-12 18:13:36.760849
160	54	1	2022-07-12 18:13:37.118572	2022-07-12 18:13:37.118572
161	54	2	2022-07-12 18:13:37.123918	2022-07-12 18:13:37.123918
162	54	3	2022-07-12 18:13:37.13026	2022-07-12 18:13:37.13026
163	55	1	2022-07-12 18:13:37.476278	2022-07-12 18:13:37.476278
164	55	2	2022-07-12 18:13:37.482588	2022-07-12 18:13:37.482588
165	55	3	2022-07-12 18:13:37.488379	2022-07-12 18:13:37.488379
166	56	1	2022-07-12 18:13:37.855999	2022-07-12 18:13:37.855999
167	56	2	2022-07-12 18:13:37.862453	2022-07-12 18:13:37.862453
168	56	3	2022-07-12 18:13:37.868283	2022-07-12 18:13:37.868283
169	57	1	2022-07-12 18:13:38.207653	2022-07-12 18:13:38.207653
170	57	2	2022-07-12 18:13:38.213908	2022-07-12 18:13:38.213908
171	57	3	2022-07-12 18:13:38.219795	2022-07-12 18:13:38.219795
172	58	1	2022-07-12 18:13:38.552998	2022-07-12 18:13:38.552998
173	58	2	2022-07-12 18:13:38.558748	2022-07-12 18:13:38.558748
174	58	3	2022-07-12 18:13:38.564558	2022-07-12 18:13:38.564558
175	59	1	2022-07-12 18:13:38.89942	2022-07-12 18:13:38.89942
176	59	2	2022-07-12 18:13:38.904859	2022-07-12 18:13:38.904859
177	59	3	2022-07-12 18:13:38.910263	2022-07-12 18:13:38.910263
178	60	1	2022-07-12 18:13:39.389195	2022-07-12 18:13:39.389195
179	60	2	2022-07-12 18:13:39.396007	2022-07-12 18:13:39.396007
180	60	3	2022-07-12 18:13:39.401944	2022-07-12 18:13:39.401944
181	61	1	2022-07-12 18:13:39.744162	2022-07-12 18:13:39.744162
182	61	2	2022-07-12 18:13:39.750402	2022-07-12 18:13:39.750402
183	61	3	2022-07-12 18:13:39.75649	2022-07-12 18:13:39.75649
184	62	1	2022-07-12 18:13:40.093875	2022-07-12 18:13:40.093875
185	62	2	2022-07-12 18:13:40.099758	2022-07-12 18:13:40.099758
186	62	3	2022-07-12 18:13:40.105523	2022-07-12 18:13:40.105523
187	63	1	2022-07-12 18:13:40.426786	2022-07-12 18:13:40.426786
188	63	2	2022-07-12 18:13:40.432778	2022-07-12 18:13:40.432778
189	63	3	2022-07-12 18:13:40.438503	2022-07-12 18:13:40.438503
190	64	1	2022-07-12 18:13:40.775212	2022-07-12 18:13:40.775212
191	64	2	2022-07-12 18:13:40.78123	2022-07-12 18:13:40.78123
192	64	3	2022-07-12 18:13:40.786738	2022-07-12 18:13:40.786738
193	65	1	2022-07-12 18:13:41.11639	2022-07-12 18:13:41.11639
194	65	2	2022-07-12 18:13:41.123019	2022-07-12 18:13:41.123019
195	65	3	2022-07-12 18:13:41.129483	2022-07-12 18:13:41.129483
196	66	1	2022-07-12 18:13:41.489595	2022-07-12 18:13:41.489595
197	66	2	2022-07-12 18:13:41.495558	2022-07-12 18:13:41.495558
198	66	3	2022-07-12 18:13:41.501378	2022-07-12 18:13:41.501378
199	67	1	2022-07-12 18:13:41.854588	2022-07-12 18:13:41.854588
200	67	2	2022-07-12 18:13:41.862916	2022-07-12 18:13:41.862916
201	67	3	2022-07-12 18:13:41.869994	2022-07-12 18:13:41.869994
202	68	1	2022-07-12 18:13:42.237211	2022-07-12 18:13:42.237211
203	68	2	2022-07-12 18:13:42.243654	2022-07-12 18:13:42.243654
204	68	3	2022-07-12 18:13:42.250544	2022-07-12 18:13:42.250544
205	69	1	2022-07-12 18:13:42.621994	2022-07-12 18:13:42.621994
206	69	2	2022-07-12 18:13:42.627875	2022-07-12 18:13:42.627875
207	69	3	2022-07-12 18:13:42.635078	2022-07-12 18:13:42.635078
208	70	1	2022-07-12 18:13:42.993477	2022-07-12 18:13:42.993477
209	70	2	2022-07-12 18:13:42.999431	2022-07-12 18:13:42.999431
210	70	3	2022-07-12 18:13:43.005463	2022-07-12 18:13:43.005463
211	71	1	2022-07-12 18:13:43.349304	2022-07-12 18:13:43.349304
212	71	2	2022-07-12 18:13:43.35562	2022-07-12 18:13:43.35562
213	71	3	2022-07-12 18:13:43.361399	2022-07-12 18:13:43.361399
214	72	1	2022-07-12 18:13:43.701202	2022-07-12 18:13:43.701202
215	72	2	2022-07-12 18:13:43.707166	2022-07-12 18:13:43.707166
216	72	3	2022-07-12 18:13:43.713174	2022-07-12 18:13:43.713174
217	73	1	2022-07-12 18:13:44.074126	2022-07-12 18:13:44.074126
218	73	2	2022-07-12 18:13:44.080298	2022-07-12 18:13:44.080298
219	73	3	2022-07-12 18:13:44.086991	2022-07-12 18:13:44.086991
220	74	1	2022-07-12 18:13:44.464662	2022-07-12 18:13:44.464662
221	74	2	2022-07-12 18:13:44.471287	2022-07-12 18:13:44.471287
222	74	3	2022-07-12 18:13:44.478285	2022-07-12 18:13:44.478285
223	75	1	2022-07-12 18:13:45.011185	2022-07-12 18:13:45.011185
224	75	2	2022-07-12 18:13:45.017849	2022-07-12 18:13:45.017849
225	75	3	2022-07-12 18:13:45.023604	2022-07-12 18:13:45.023604
226	76	1	2022-07-12 18:13:45.412766	2022-07-12 18:13:45.412766
227	76	2	2022-07-12 18:13:45.421853	2022-07-12 18:13:45.421853
228	76	3	2022-07-12 18:13:45.428221	2022-07-12 18:13:45.428221
229	77	1	2022-07-12 18:13:45.832101	2022-07-12 18:13:45.832101
230	77	2	2022-07-12 18:13:45.849066	2022-07-12 18:13:45.849066
231	77	3	2022-07-12 18:13:45.861508	2022-07-12 18:13:45.861508
232	78	1	2022-07-12 18:13:46.561117	2022-07-12 18:13:46.561117
233	78	2	2022-07-12 18:13:46.568557	2022-07-12 18:13:46.568557
234	78	3	2022-07-12 18:13:46.575232	2022-07-12 18:13:46.575232
235	79	1	2022-07-12 18:13:47.002271	2022-07-12 18:13:47.002271
236	79	2	2022-07-12 18:13:47.008452	2022-07-12 18:13:47.008452
237	79	3	2022-07-12 18:13:47.014169	2022-07-12 18:13:47.014169
238	80	1	2022-07-12 18:13:47.395905	2022-07-12 18:13:47.395905
239	80	2	2022-07-12 18:13:47.401666	2022-07-12 18:13:47.401666
240	80	3	2022-07-12 18:13:47.40741	2022-07-12 18:13:47.40741
241	81	1	2022-07-12 18:13:47.749234	2022-07-12 18:13:47.749234
242	81	2	2022-07-12 18:13:47.755112	2022-07-12 18:13:47.755112
243	81	3	2022-07-12 18:13:47.761728	2022-07-12 18:13:47.761728
244	82	1	2022-07-12 18:13:48.096119	2022-07-12 18:13:48.096119
245	82	2	2022-07-12 18:13:48.101897	2022-07-12 18:13:48.101897
246	82	3	2022-07-12 18:13:48.107904	2022-07-12 18:13:48.107904
247	83	1	2022-07-12 18:13:48.470157	2022-07-12 18:13:48.470157
248	83	2	2022-07-12 18:13:48.47659	2022-07-12 18:13:48.47659
249	83	3	2022-07-12 18:13:48.482593	2022-07-12 18:13:48.482593
250	84	1	2022-07-12 18:13:48.863986	2022-07-12 18:13:48.863986
251	84	2	2022-07-12 18:13:48.870058	2022-07-12 18:13:48.870058
252	84	3	2022-07-12 18:13:48.877139	2022-07-12 18:13:48.877139
253	85	1	2022-07-12 18:13:49.238018	2022-07-12 18:13:49.238018
254	85	2	2022-07-12 18:13:49.244722	2022-07-12 18:13:49.244722
255	85	3	2022-07-12 18:13:49.251091	2022-07-12 18:13:49.251091
256	86	1	2022-07-12 18:13:49.592752	2022-07-12 18:13:49.592752
257	86	2	2022-07-12 18:13:49.598487	2022-07-12 18:13:49.598487
258	86	3	2022-07-12 18:13:49.605455	2022-07-12 18:13:49.605455
259	87	1	2022-07-12 18:13:49.974723	2022-07-12 18:13:49.974723
260	87	2	2022-07-12 18:13:49.981019	2022-07-12 18:13:49.981019
261	87	3	2022-07-12 18:13:49.987121	2022-07-12 18:13:49.987121
262	88	1	2022-07-12 18:13:50.340927	2022-07-12 18:13:50.340927
263	88	2	2022-07-12 18:13:50.349408	2022-07-12 18:13:50.349408
264	88	3	2022-07-12 18:13:50.358928	2022-07-12 18:13:50.358928
265	89	1	2022-07-12 18:13:50.892306	2022-07-12 18:13:50.892306
266	89	2	2022-07-12 18:13:50.899689	2022-07-12 18:13:50.899689
267	89	3	2022-07-12 18:13:50.906085	2022-07-12 18:13:50.906085
268	90	1	2022-07-12 18:13:51.312594	2022-07-12 18:13:51.312594
269	90	2	2022-07-12 18:13:51.342594	2022-07-12 18:13:51.342594
270	90	3	2022-07-12 18:13:51.352469	2022-07-12 18:13:51.352469
271	91	1	2022-07-12 18:13:51.758865	2022-07-12 18:13:51.758865
272	91	2	2022-07-12 18:13:51.764915	2022-07-12 18:13:51.764915
273	91	3	2022-07-12 18:13:51.770894	2022-07-12 18:13:51.770894
274	92	1	2022-07-12 18:13:52.245528	2022-07-12 18:13:52.245528
275	92	2	2022-07-12 18:13:52.252501	2022-07-12 18:13:52.252501
276	92	3	2022-07-12 18:13:52.259511	2022-07-12 18:13:52.259511
277	93	1	2022-07-12 18:13:52.620424	2022-07-12 18:13:52.620424
278	93	2	2022-07-12 18:13:52.627298	2022-07-12 18:13:52.627298
279	93	3	2022-07-12 18:13:52.633608	2022-07-12 18:13:52.633608
280	94	1	2022-07-12 18:13:53.011419	2022-07-12 18:13:53.011419
281	94	2	2022-07-12 18:13:53.017638	2022-07-12 18:13:53.017638
282	94	3	2022-07-12 18:13:53.024088	2022-07-12 18:13:53.024088
283	95	1	2022-07-12 18:13:53.3759	2022-07-12 18:13:53.3759
284	95	2	2022-07-12 18:13:53.381545	2022-07-12 18:13:53.381545
285	95	3	2022-07-12 18:13:53.388302	2022-07-12 18:13:53.388302
286	96	1	2022-07-12 18:13:53.80834	2022-07-12 18:13:53.80834
287	96	2	2022-07-12 18:13:53.814148	2022-07-12 18:13:53.814148
288	96	3	2022-07-12 18:13:53.819829	2022-07-12 18:13:53.819829
289	97	1	2022-07-12 18:13:54.168998	2022-07-12 18:13:54.168998
290	97	2	2022-07-12 18:13:54.17527	2022-07-12 18:13:54.17527
291	97	3	2022-07-12 18:13:54.181654	2022-07-12 18:13:54.181654
292	98	1	2022-07-12 18:13:54.514447	2022-07-12 18:13:54.514447
293	98	2	2022-07-12 18:13:54.520814	2022-07-12 18:13:54.520814
294	98	3	2022-07-12 18:13:54.527043	2022-07-12 18:13:54.527043
295	99	1	2022-07-12 18:13:54.869499	2022-07-12 18:13:54.869499
296	99	2	2022-07-12 18:13:54.875422	2022-07-12 18:13:54.875422
297	99	3	2022-07-12 18:13:54.881126	2022-07-12 18:13:54.881126
298	100	1	2022-07-12 18:13:55.224584	2022-07-12 18:13:55.224584
299	100	2	2022-07-12 18:13:55.230587	2022-07-12 18:13:55.230587
300	100	3	2022-07-12 18:13:55.236193	2022-07-12 18:13:55.236193
301	101	1	2022-07-12 18:13:55.578684	2022-07-12 18:13:55.578684
302	101	2	2022-07-12 18:13:55.584385	2022-07-12 18:13:55.584385
303	101	3	2022-07-12 18:13:55.590576	2022-07-12 18:13:55.590576
304	102	1	2022-07-12 18:13:55.964783	2022-07-12 18:13:55.964783
305	102	2	2022-07-12 18:13:55.970627	2022-07-12 18:13:55.970627
306	102	3	2022-07-12 18:13:55.976264	2022-07-12 18:13:55.976264
307	103	1	2022-07-12 18:13:56.388267	2022-07-12 18:13:56.388267
308	103	2	2022-07-12 18:13:56.394559	2022-07-12 18:13:56.394559
309	103	3	2022-07-12 18:13:56.400372	2022-07-12 18:13:56.400372
310	104	1	2022-07-12 18:13:56.88211	2022-07-12 18:13:56.88211
311	104	2	2022-07-12 18:13:56.887848	2022-07-12 18:13:56.887848
312	104	3	2022-07-12 18:13:56.893422	2022-07-12 18:13:56.893422
313	105	1	2022-07-12 18:13:57.241316	2022-07-12 18:13:57.241316
314	105	2	2022-07-12 18:13:57.249216	2022-07-12 18:13:57.249216
315	105	3	2022-07-12 18:13:57.256902	2022-07-12 18:13:57.256902
316	106	1	2022-07-12 18:13:57.626869	2022-07-12 18:13:57.626869
317	106	2	2022-07-12 18:13:57.633398	2022-07-12 18:13:57.633398
318	106	3	2022-07-12 18:13:57.640037	2022-07-12 18:13:57.640037
319	107	1	2022-07-12 18:13:58.00104	2022-07-12 18:13:58.00104
320	107	2	2022-07-12 18:13:58.007403	2022-07-12 18:13:58.007403
321	107	3	2022-07-12 18:13:58.01348	2022-07-12 18:13:58.01348
322	108	1	2022-07-12 18:13:58.359361	2022-07-12 18:13:58.359361
323	108	2	2022-07-12 18:13:58.365092	2022-07-12 18:13:58.365092
324	108	3	2022-07-12 18:13:58.370907	2022-07-12 18:13:58.370907
325	109	1	2022-07-12 18:13:58.757657	2022-07-12 18:13:58.757657
326	109	2	2022-07-12 18:13:58.763909	2022-07-12 18:13:58.763909
327	109	3	2022-07-12 18:13:58.769494	2022-07-12 18:13:58.769494
328	110	1	2022-07-12 18:13:59.105033	2022-07-12 18:13:59.105033
329	110	2	2022-07-12 18:13:59.111092	2022-07-12 18:13:59.111092
330	110	3	2022-07-12 18:13:59.117467	2022-07-12 18:13:59.117467
331	111	1	2022-07-12 18:13:59.457691	2022-07-12 18:13:59.457691
332	111	2	2022-07-12 18:13:59.463591	2022-07-12 18:13:59.463591
333	111	3	2022-07-12 18:13:59.469908	2022-07-12 18:13:59.469908
334	112	1	2022-07-12 18:13:59.808853	2022-07-12 18:13:59.808853
335	112	2	2022-07-12 18:13:59.81516	2022-07-12 18:13:59.81516
336	112	3	2022-07-12 18:13:59.821428	2022-07-12 18:13:59.821428
337	113	1	2022-07-12 18:14:00.244009	2022-07-12 18:14:00.244009
338	113	2	2022-07-12 18:14:00.251509	2022-07-12 18:14:00.251509
339	113	3	2022-07-12 18:14:00.257647	2022-07-12 18:14:00.257647
340	114	1	2022-07-12 18:14:00.685835	2022-07-12 18:14:00.685835
341	114	2	2022-07-12 18:14:00.691449	2022-07-12 18:14:00.691449
342	114	3	2022-07-12 18:14:00.698193	2022-07-12 18:14:00.698193
343	115	1	2022-07-12 18:14:01.039502	2022-07-12 18:14:01.039502
344	115	2	2022-07-12 18:14:01.04508	2022-07-12 18:14:01.04508
345	115	3	2022-07-12 18:14:01.05082	2022-07-12 18:14:01.05082
346	116	1	2022-07-12 18:14:01.388872	2022-07-12 18:14:01.388872
347	116	2	2022-07-12 18:14:01.394901	2022-07-12 18:14:01.394901
348	116	3	2022-07-12 18:14:01.40089	2022-07-12 18:14:01.40089
\.


--
-- Data for Name: spree_products_taxons; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.spree_products_taxons (id, product_id, taxon_id, "position", created_at, updated_at) FROM stdin;
1	1	2	1	2022-07-12 18:13:17.257815	2022-07-12 18:13:17.257815
2	1	5	1	2022-07-12 18:13:17.266964	2022-07-12 18:13:17.266964
3	2	2	2	2022-07-12 18:13:17.593163	2022-07-12 18:13:17.593163
4	2	5	2	2022-07-12 18:13:17.641508	2022-07-12 18:13:17.641508
5	3	2	3	2022-07-12 18:13:18.085787	2022-07-12 18:13:18.085787
6	3	5	3	2022-07-12 18:13:18.094498	2022-07-12 18:13:18.094498
7	4	2	4	2022-07-12 18:13:18.424005	2022-07-12 18:13:18.424005
8	4	5	4	2022-07-12 18:13:18.433049	2022-07-12 18:13:18.433049
9	5	2	5	2022-07-12 18:13:18.754963	2022-07-12 18:13:18.754963
10	5	5	5	2022-07-12 18:13:18.763709	2022-07-12 18:13:18.763709
11	6	2	6	2022-07-12 18:13:19.097393	2022-07-12 18:13:19.097393
12	6	5	6	2022-07-12 18:13:19.106591	2022-07-12 18:13:19.106591
13	7	2	7	2022-07-12 18:13:19.436361	2022-07-12 18:13:19.436361
14	7	5	7	2022-07-12 18:13:19.445738	2022-07-12 18:13:19.445738
15	8	2	8	2022-07-12 18:13:19.774911	2022-07-12 18:13:19.774911
16	8	5	8	2022-07-12 18:13:19.78367	2022-07-12 18:13:19.78367
17	9	2	9	2022-07-12 18:13:20.120432	2022-07-12 18:13:20.120432
18	9	5	9	2022-07-12 18:13:20.129405	2022-07-12 18:13:20.129405
19	10	2	10	2022-07-12 18:13:20.466936	2022-07-12 18:13:20.466936
20	10	5	10	2022-07-12 18:13:20.476222	2022-07-12 18:13:20.476222
21	11	2	11	2022-07-12 18:13:20.798717	2022-07-12 18:13:20.798717
22	11	5	11	2022-07-12 18:13:20.806972	2022-07-12 18:13:20.806972
23	12	2	12	2022-07-12 18:13:21.132428	2022-07-12 18:13:21.132428
24	12	6	1	2022-07-12 18:13:21.141846	2022-07-12 18:13:21.141846
25	13	2	13	2022-07-12 18:13:21.469565	2022-07-12 18:13:21.469565
26	13	6	2	2022-07-12 18:13:21.477771	2022-07-12 18:13:21.477771
27	14	2	14	2022-07-12 18:13:21.797177	2022-07-12 18:13:21.797177
28	14	6	3	2022-07-12 18:13:21.806018	2022-07-12 18:13:21.806018
29	15	2	15	2022-07-12 18:13:22.153189	2022-07-12 18:13:22.153189
30	15	6	4	2022-07-12 18:13:22.161503	2022-07-12 18:13:22.161503
31	16	2	16	2022-07-12 18:13:22.508094	2022-07-12 18:13:22.508094
32	16	6	5	2022-07-12 18:13:22.516936	2022-07-12 18:13:22.516936
33	17	2	17	2022-07-12 18:13:22.997052	2022-07-12 18:13:22.997052
34	17	6	6	2022-07-12 18:13:23.006188	2022-07-12 18:13:23.006188
35	18	2	18	2022-07-12 18:13:23.342353	2022-07-12 18:13:23.342353
36	18	6	7	2022-07-12 18:13:23.35246	2022-07-12 18:13:23.35246
37	19	2	19	2022-07-12 18:13:23.700869	2022-07-12 18:13:23.700869
38	19	6	8	2022-07-12 18:13:23.710555	2022-07-12 18:13:23.710555
39	20	2	20	2022-07-12 18:13:24.070578	2022-07-12 18:13:24.070578
40	20	7	1	2022-07-12 18:13:24.079528	2022-07-12 18:13:24.079528
41	21	2	21	2022-07-12 18:13:24.428476	2022-07-12 18:13:24.428476
42	21	7	2	2022-07-12 18:13:24.438457	2022-07-12 18:13:24.438457
43	22	2	22	2022-07-12 18:13:24.787892	2022-07-12 18:13:24.787892
44	22	7	3	2022-07-12 18:13:24.797493	2022-07-12 18:13:24.797493
45	23	2	23	2022-07-12 18:13:25.129284	2022-07-12 18:13:25.129284
46	23	7	4	2022-07-12 18:13:25.141457	2022-07-12 18:13:25.141457
47	24	2	24	2022-07-12 18:13:25.491389	2022-07-12 18:13:25.491389
48	24	7	5	2022-07-12 18:13:25.500375	2022-07-12 18:13:25.500375
49	25	2	25	2022-07-12 18:13:25.848984	2022-07-12 18:13:25.848984
50	25	7	6	2022-07-12 18:13:25.859321	2022-07-12 18:13:25.859321
51	26	2	26	2022-07-12 18:13:26.288706	2022-07-12 18:13:26.288706
52	26	7	7	2022-07-12 18:13:26.300188	2022-07-12 18:13:26.300188
53	27	2	27	2022-07-12 18:13:26.659503	2022-07-12 18:13:26.659503
54	27	7	8	2022-07-12 18:13:26.668696	2022-07-12 18:13:26.668696
55	28	2	28	2022-07-12 18:13:27.085492	2022-07-12 18:13:27.085492
56	28	8	1	2022-07-12 18:13:27.096582	2022-07-12 18:13:27.096582
57	29	2	29	2022-07-12 18:13:27.497762	2022-07-12 18:13:27.497762
58	29	8	2	2022-07-12 18:13:27.507003	2022-07-12 18:13:27.507003
59	30	2	30	2022-07-12 18:13:27.881808	2022-07-12 18:13:27.881808
60	30	8	3	2022-07-12 18:13:27.891382	2022-07-12 18:13:27.891382
61	31	2	31	2022-07-12 18:13:28.345543	2022-07-12 18:13:28.345543
62	31	8	4	2022-07-12 18:13:28.355712	2022-07-12 18:13:28.355712
63	32	2	32	2022-07-12 18:13:28.859973	2022-07-12 18:13:28.859973
64	32	8	5	2022-07-12 18:13:28.869941	2022-07-12 18:13:28.869941
65	33	2	33	2022-07-12 18:13:29.229792	2022-07-12 18:13:29.229792
66	33	8	6	2022-07-12 18:13:29.238701	2022-07-12 18:13:29.238701
67	34	2	34	2022-07-12 18:13:29.590321	2022-07-12 18:13:29.590321
68	34	8	7	2022-07-12 18:13:29.599506	2022-07-12 18:13:29.599506
69	35	2	35	2022-07-12 18:13:29.958954	2022-07-12 18:13:29.958954
70	35	8	8	2022-07-12 18:13:29.968512	2022-07-12 18:13:29.968512
71	36	3	1	2022-07-12 18:13:30.32295	2022-07-12 18:13:30.32295
72	36	9	1	2022-07-12 18:13:30.332566	2022-07-12 18:13:30.332566
73	37	3	2	2022-07-12 18:13:30.690372	2022-07-12 18:13:30.690372
74	37	9	2	2022-07-12 18:13:30.700187	2022-07-12 18:13:30.700187
75	38	3	3	2022-07-12 18:13:31.058603	2022-07-12 18:13:31.058603
76	38	9	3	2022-07-12 18:13:31.068046	2022-07-12 18:13:31.068046
77	39	3	4	2022-07-12 18:13:31.42453	2022-07-12 18:13:31.42453
78	39	9	4	2022-07-12 18:13:31.433171	2022-07-12 18:13:31.433171
79	40	3	5	2022-07-12 18:13:31.782399	2022-07-12 18:13:31.782399
80	40	9	5	2022-07-12 18:13:31.791509	2022-07-12 18:13:31.791509
81	41	3	6	2022-07-12 18:13:32.138887	2022-07-12 18:13:32.138887
82	41	9	6	2022-07-12 18:13:32.148819	2022-07-12 18:13:32.148819
83	42	3	7	2022-07-12 18:13:32.501347	2022-07-12 18:13:32.501347
84	42	9	7	2022-07-12 18:13:32.511242	2022-07-12 18:13:32.511242
85	43	3	8	2022-07-12 18:13:32.861786	2022-07-12 18:13:32.861786
86	43	9	8	2022-07-12 18:13:32.871015	2022-07-12 18:13:32.871015
87	44	3	9	2022-07-12 18:13:33.234815	2022-07-12 18:13:33.234815
88	44	9	9	2022-07-12 18:13:33.243902	2022-07-12 18:13:33.243902
89	45	3	10	2022-07-12 18:13:33.60509	2022-07-12 18:13:33.60509
90	45	9	10	2022-07-12 18:13:33.614559	2022-07-12 18:13:33.614559
91	46	3	11	2022-07-12 18:13:34.12478	2022-07-12 18:13:34.12478
92	46	10	1	2022-07-12 18:13:34.135961	2022-07-12 18:13:34.135961
93	47	3	12	2022-07-12 18:13:34.507182	2022-07-12 18:13:34.507182
94	47	10	2	2022-07-12 18:13:34.516151	2022-07-12 18:13:34.516151
95	48	3	13	2022-07-12 18:13:34.878782	2022-07-12 18:13:34.878782
96	48	10	3	2022-07-12 18:13:34.887925	2022-07-12 18:13:34.887925
97	49	3	14	2022-07-12 18:13:35.233775	2022-07-12 18:13:35.233775
98	49	10	4	2022-07-12 18:13:35.242751	2022-07-12 18:13:35.242751
99	50	3	15	2022-07-12 18:13:35.589712	2022-07-12 18:13:35.589712
100	50	10	5	2022-07-12 18:13:35.599524	2022-07-12 18:13:35.599524
101	51	3	16	2022-07-12 18:13:35.97185	2022-07-12 18:13:35.97185
102	51	10	6	2022-07-12 18:13:35.98127	2022-07-12 18:13:35.98127
103	52	3	17	2022-07-12 18:13:36.340174	2022-07-12 18:13:36.340174
104	52	10	7	2022-07-12 18:13:36.349833	2022-07-12 18:13:36.349833
105	53	3	18	2022-07-12 18:13:36.704279	2022-07-12 18:13:36.704279
106	53	10	8	2022-07-12 18:13:36.713821	2022-07-12 18:13:36.713821
107	54	3	19	2022-07-12 18:13:37.07545	2022-07-12 18:13:37.07545
108	54	10	9	2022-07-12 18:13:37.084752	2022-07-12 18:13:37.084752
109	55	3	20	2022-07-12 18:13:37.429863	2022-07-12 18:13:37.429863
110	55	10	10	2022-07-12 18:13:37.439719	2022-07-12 18:13:37.439719
111	56	3	21	2022-07-12 18:13:37.805803	2022-07-12 18:13:37.805803
112	56	10	11	2022-07-12 18:13:37.815172	2022-07-12 18:13:37.815172
113	57	3	22	2022-07-12 18:13:38.164672	2022-07-12 18:13:38.164672
114	57	10	12	2022-07-12 18:13:38.173952	2022-07-12 18:13:38.173952
115	58	3	23	2022-07-12 18:13:38.509775	2022-07-12 18:13:38.509775
116	58	11	1	2022-07-12 18:13:38.518521	2022-07-12 18:13:38.518521
117	59	3	24	2022-07-12 18:13:38.855065	2022-07-12 18:13:38.855065
118	59	11	2	2022-07-12 18:13:38.864632	2022-07-12 18:13:38.864632
119	60	3	25	2022-07-12 18:13:39.342318	2022-07-12 18:13:39.342318
120	60	11	3	2022-07-12 18:13:39.352196	2022-07-12 18:13:39.352196
121	61	3	26	2022-07-12 18:13:39.698794	2022-07-12 18:13:39.698794
122	61	11	4	2022-07-12 18:13:39.707959	2022-07-12 18:13:39.707959
123	62	3	27	2022-07-12 18:13:40.050501	2022-07-12 18:13:40.050501
124	62	11	5	2022-07-12 18:13:40.059324	2022-07-12 18:13:40.059324
125	63	3	28	2022-07-12 18:13:40.383766	2022-07-12 18:13:40.383766
126	63	11	6	2022-07-12 18:13:40.392594	2022-07-12 18:13:40.392594
127	64	3	29	2022-07-12 18:13:40.732799	2022-07-12 18:13:40.732799
128	64	11	7	2022-07-12 18:13:40.741496	2022-07-12 18:13:40.741496
129	65	3	30	2022-07-12 18:13:41.071827	2022-07-12 18:13:41.071827
130	65	11	8	2022-07-12 18:13:41.081416	2022-07-12 18:13:41.081416
131	66	3	31	2022-07-12 18:13:41.442858	2022-07-12 18:13:41.442858
132	66	11	9	2022-07-12 18:13:41.451879	2022-07-12 18:13:41.451879
133	67	3	32	2022-07-12 18:13:41.803367	2022-07-12 18:13:41.803367
134	67	11	10	2022-07-12 18:13:41.812969	2022-07-12 18:13:41.812969
135	68	3	33	2022-07-12 18:13:42.189548	2022-07-12 18:13:42.189548
136	68	11	11	2022-07-12 18:13:42.199745	2022-07-12 18:13:42.199745
137	69	3	34	2022-07-12 18:13:42.576317	2022-07-12 18:13:42.576317
138	69	11	12	2022-07-12 18:13:42.586476	2022-07-12 18:13:42.586476
139	70	3	35	2022-07-12 18:13:42.950476	2022-07-12 18:13:42.950476
140	70	12	1	2022-07-12 18:13:42.958535	2022-07-12 18:13:42.958535
141	71	3	36	2022-07-12 18:13:43.303491	2022-07-12 18:13:43.303491
142	71	12	2	2022-07-12 18:13:43.31287	2022-07-12 18:13:43.31287
143	72	3	37	2022-07-12 18:13:43.648781	2022-07-12 18:13:43.648781
144	72	12	3	2022-07-12 18:13:43.657979	2022-07-12 18:13:43.657979
145	73	3	38	2022-07-12 18:13:44.025231	2022-07-12 18:13:44.025231
146	73	12	4	2022-07-12 18:13:44.03527	2022-07-12 18:13:44.03527
147	74	3	39	2022-07-12 18:13:44.41445	2022-07-12 18:13:44.41445
148	74	12	5	2022-07-12 18:13:44.425816	2022-07-12 18:13:44.425816
149	75	3	40	2022-07-12 18:13:44.96084	2022-07-12 18:13:44.96084
150	75	12	6	2022-07-12 18:13:44.972931	2022-07-12 18:13:44.972931
151	76	3	41	2022-07-12 18:13:45.338135	2022-07-12 18:13:45.338135
152	76	13	1	2022-07-12 18:13:45.348405	2022-07-12 18:13:45.348405
153	77	3	42	2022-07-12 18:13:45.745526	2022-07-12 18:13:45.745526
154	77	13	2	2022-07-12 18:13:45.755144	2022-07-12 18:13:45.755144
155	78	3	43	2022-07-12 18:13:46.508254	2022-07-12 18:13:46.508254
156	78	13	3	2022-07-12 18:13:46.520049	2022-07-12 18:13:46.520049
157	79	3	44	2022-07-12 18:13:46.950338	2022-07-12 18:13:46.950338
158	79	13	4	2022-07-12 18:13:46.959933	2022-07-12 18:13:46.959933
159	80	3	45	2022-07-12 18:13:47.350403	2022-07-12 18:13:47.350403
160	80	13	5	2022-07-12 18:13:47.359211	2022-07-12 18:13:47.359211
161	81	3	46	2022-07-12 18:13:47.704534	2022-07-12 18:13:47.704534
162	81	13	6	2022-07-12 18:13:47.713787	2022-07-12 18:13:47.713787
163	82	3	47	2022-07-12 18:13:48.0525	2022-07-12 18:13:48.0525
164	82	13	7	2022-07-12 18:13:48.061654	2022-07-12 18:13:48.061654
165	83	3	48	2022-07-12 18:13:48.42766	2022-07-12 18:13:48.42766
166	83	13	8	2022-07-12 18:13:48.436375	2022-07-12 18:13:48.436375
167	84	3	49	2022-07-12 18:13:48.816227	2022-07-12 18:13:48.816227
168	84	13	9	2022-07-12 18:13:48.826271	2022-07-12 18:13:48.826271
169	85	3	50	2022-07-12 18:13:49.187574	2022-07-12 18:13:49.187574
170	85	14	1	2022-07-12 18:13:49.197396	2022-07-12 18:13:49.197396
171	86	3	51	2022-07-12 18:13:49.548316	2022-07-12 18:13:49.548316
172	86	14	2	2022-07-12 18:13:49.557882	2022-07-12 18:13:49.557882
173	87	3	52	2022-07-12 18:13:49.922913	2022-07-12 18:13:49.922913
174	87	14	3	2022-07-12 18:13:49.936212	2022-07-12 18:13:49.936212
175	88	3	53	2022-07-12 18:13:50.297156	2022-07-12 18:13:50.297156
176	88	14	4	2022-07-12 18:13:50.306266	2022-07-12 18:13:50.306266
177	89	3	54	2022-07-12 18:13:50.84314	2022-07-12 18:13:50.84314
178	89	14	5	2022-07-12 18:13:50.854455	2022-07-12 18:13:50.854455
179	90	3	55	2022-07-12 18:13:51.246671	2022-07-12 18:13:51.246671
180	90	14	6	2022-07-12 18:13:51.259348	2022-07-12 18:13:51.259348
181	91	3	56	2022-07-12 18:13:51.711692	2022-07-12 18:13:51.711692
182	91	14	7	2022-07-12 18:13:51.721354	2022-07-12 18:13:51.721354
183	92	3	57	2022-07-12 18:13:52.177279	2022-07-12 18:13:52.177279
184	92	14	8	2022-07-12 18:13:52.193268	2022-07-12 18:13:52.193268
185	93	3	58	2022-07-12 18:13:52.574242	2022-07-12 18:13:52.574242
186	93	14	9	2022-07-12 18:13:52.583786	2022-07-12 18:13:52.583786
187	94	3	59	2022-07-12 18:13:52.966488	2022-07-12 18:13:52.966488
188	94	14	10	2022-07-12 18:13:52.975406	2022-07-12 18:13:52.975406
189	95	3	60	2022-07-12 18:13:53.326687	2022-07-12 18:13:53.326687
190	95	14	11	2022-07-12 18:13:53.336098	2022-07-12 18:13:53.336098
191	96	3	61	2022-07-12 18:13:53.762274	2022-07-12 18:13:53.762274
192	96	14	12	2022-07-12 18:13:53.772014	2022-07-12 18:13:53.772014
193	97	4	1	2022-07-12 18:13:54.124597	2022-07-12 18:13:54.124597
194	97	15	1	2022-07-12 18:13:54.134037	2022-07-12 18:13:54.134037
195	98	4	2	2022-07-12 18:13:54.470387	2022-07-12 18:13:54.470387
196	98	15	2	2022-07-12 18:13:54.479716	2022-07-12 18:13:54.479716
197	99	4	3	2022-07-12 18:13:54.826277	2022-07-12 18:13:54.826277
198	99	15	3	2022-07-12 18:13:54.835421	2022-07-12 18:13:54.835421
199	100	4	4	2022-07-12 18:13:55.18043	2022-07-12 18:13:55.18043
200	100	15	4	2022-07-12 18:13:55.189325	2022-07-12 18:13:55.189325
201	101	4	5	2022-07-12 18:13:55.527524	2022-07-12 18:13:55.527524
202	101	15	5	2022-07-12 18:13:55.536325	2022-07-12 18:13:55.536325
203	102	4	6	2022-07-12 18:13:55.918055	2022-07-12 18:13:55.918055
204	102	15	6	2022-07-12 18:13:55.929681	2022-07-12 18:13:55.929681
205	103	4	7	2022-07-12 18:13:56.343267	2022-07-12 18:13:56.343267
206	103	15	7	2022-07-12 18:13:56.352422	2022-07-12 18:13:56.352422
207	104	4	8	2022-07-12 18:13:56.836642	2022-07-12 18:13:56.836642
208	104	15	8	2022-07-12 18:13:56.846102	2022-07-12 18:13:56.846102
209	105	4	9	2022-07-12 18:13:57.190881	2022-07-12 18:13:57.190881
210	105	16	1	2022-07-12 18:13:57.202395	2022-07-12 18:13:57.202395
211	106	4	10	2022-07-12 18:13:57.579569	2022-07-12 18:13:57.579569
212	106	16	2	2022-07-12 18:13:57.589893	2022-07-12 18:13:57.589893
213	107	4	11	2022-07-12 18:13:57.95347	2022-07-12 18:13:57.95347
214	107	16	3	2022-07-12 18:13:57.964115	2022-07-12 18:13:57.964115
215	108	4	12	2022-07-12 18:13:58.30811	2022-07-12 18:13:58.30811
216	108	16	4	2022-07-12 18:13:58.320283	2022-07-12 18:13:58.320283
217	109	4	13	2022-07-12 18:13:58.705489	2022-07-12 18:13:58.705489
218	109	16	5	2022-07-12 18:13:58.719865	2022-07-12 18:13:58.719865
219	110	4	14	2022-07-12 18:13:59.05951	2022-07-12 18:13:59.05951
220	110	17	1	2022-07-12 18:13:59.069627	2022-07-12 18:13:59.069627
221	111	4	15	2022-07-12 18:13:59.41309	2022-07-12 18:13:59.41309
222	111	17	2	2022-07-12 18:13:59.423275	2022-07-12 18:13:59.423275
223	112	4	16	2022-07-12 18:13:59.765807	2022-07-12 18:13:59.765807
224	112	17	3	2022-07-12 18:13:59.775117	2022-07-12 18:13:59.775117
225	113	4	17	2022-07-12 18:14:00.197006	2022-07-12 18:14:00.197006
226	113	17	4	2022-07-12 18:14:00.20715	2022-07-12 18:14:00.20715
227	114	4	18	2022-07-12 18:14:00.642359	2022-07-12 18:14:00.642359
228	114	17	5	2022-07-12 18:14:00.650834	2022-07-12 18:14:00.650834
229	115	4	19	2022-07-12 18:14:00.995109	2022-07-12 18:14:00.995109
230	115	17	6	2022-07-12 18:14:01.00486	2022-07-12 18:14:01.00486
231	116	4	20	2022-07-12 18:14:01.345073	2022-07-12 18:14:01.345073
232	116	17	7	2022-07-12 18:14:01.353728	2022-07-12 18:14:01.353728
233	8	20	1	2022-07-12 18:14:01.557142	2022-07-12 18:14:01.557142
234	25	20	2	2022-07-12 18:14:01.56626	2022-07-12 18:14:01.56626
235	82	20	3	2022-07-12 18:14:01.576199	2022-07-12 18:14:01.576199
236	38	20	4	2022-07-12 18:14:01.585763	2022-07-12 18:14:01.585763
237	15	20	5	2022-07-12 18:14:01.595287	2022-07-12 18:14:01.595287
238	20	20	6	2022-07-12 18:14:01.604963	2022-07-12 18:14:01.604963
239	7	20	7	2022-07-12 18:14:01.615199	2022-07-12 18:14:01.615199
240	92	20	8	2022-07-12 18:14:01.6246	2022-07-12 18:14:01.6246
241	86	20	9	2022-07-12 18:14:01.634123	2022-07-12 18:14:01.634123
242	30	20	10	2022-07-12 18:14:01.64852	2022-07-12 18:14:01.64852
243	105	20	11	2022-07-12 18:14:01.658846	2022-07-12 18:14:01.658846
244	65	20	12	2022-07-12 18:14:01.669279	2022-07-12 18:14:01.669279
245	108	20	13	2022-07-12 18:14:01.680832	2022-07-12 18:14:01.680832
246	17	20	14	2022-07-12 18:14:01.690562	2022-07-12 18:14:01.690562
247	11	20	15	2022-07-12 18:14:01.701126	2022-07-12 18:14:01.701126
248	46	20	16	2022-07-12 18:14:01.711466	2022-07-12 18:14:01.711466
249	90	20	17	2022-07-12 18:14:01.722595	2022-07-12 18:14:01.722595
250	74	20	18	2022-07-12 18:14:01.732495	2022-07-12 18:14:01.732495
251	18	20	19	2022-07-12 18:14:01.742384	2022-07-12 18:14:01.742384
252	110	20	20	2022-07-12 18:14:01.752901	2022-07-12 18:14:01.752901
253	111	20	21	2022-07-12 18:14:01.763689	2022-07-12 18:14:01.763689
254	89	20	22	2022-07-12 18:14:01.774172	2022-07-12 18:14:01.774172
255	112	20	23	2022-07-12 18:14:01.785181	2022-07-12 18:14:01.785181
256	69	20	24	2022-07-12 18:14:01.794964	2022-07-12 18:14:01.794964
257	97	20	25	2022-07-12 18:14:01.806211	2022-07-12 18:14:01.806211
258	48	20	26	2022-07-12 18:14:01.816631	2022-07-12 18:14:01.816631
259	47	20	27	2022-07-12 18:14:01.826843	2022-07-12 18:14:01.826843
260	79	20	28	2022-07-12 18:14:01.838912	2022-07-12 18:14:01.838912
261	70	20	29	2022-07-12 18:14:01.849492	2022-07-12 18:14:01.849492
262	55	20	30	2022-07-12 18:14:01.8586	2022-07-12 18:14:01.8586
263	111	26	1	2022-07-12 18:14:02.781778	2022-07-12 18:14:02.781778
264	100	26	2	2022-07-12 18:14:02.792044	2022-07-12 18:14:02.792044
265	106	26	3	2022-07-12 18:14:02.802094	2022-07-12 18:14:02.802094
266	110	26	4	2022-07-12 18:14:02.811902	2022-07-12 18:14:02.811902
267	35	26	5	2022-07-12 18:14:02.821329	2022-07-12 18:14:02.821329
268	68	26	6	2022-07-12 18:14:02.831064	2022-07-12 18:14:02.831064
269	49	26	7	2022-07-12 18:14:02.841222	2022-07-12 18:14:02.841222
270	19	26	8	2022-07-12 18:14:02.851366	2022-07-12 18:14:02.851366
271	63	26	9	2022-07-12 18:14:02.861229	2022-07-12 18:14:02.861229
272	97	26	10	2022-07-12 18:14:02.87197	2022-07-12 18:14:02.87197
273	33	26	11	2022-07-12 18:14:02.88241	2022-07-12 18:14:02.88241
274	1	26	12	2022-07-12 18:14:02.892457	2022-07-12 18:14:02.892457
275	112	26	13	2022-07-12 18:14:02.902815	2022-07-12 18:14:02.902815
276	115	26	14	2022-07-12 18:14:02.913592	2022-07-12 18:14:02.913592
277	50	26	15	2022-07-12 18:14:02.923568	2022-07-12 18:14:02.923568
278	85	26	16	2022-07-12 18:14:02.933894	2022-07-12 18:14:02.933894
279	2	26	17	2022-07-12 18:14:02.943467	2022-07-12 18:14:02.943467
280	14	26	18	2022-07-12 18:14:02.955301	2022-07-12 18:14:02.955301
281	82	26	19	2022-07-12 18:14:02.967352	2022-07-12 18:14:02.967352
282	98	26	20	2022-07-12 18:14:02.978025	2022-07-12 18:14:02.978025
283	28	26	21	2022-07-12 18:14:02.987825	2022-07-12 18:14:02.987825
284	80	26	22	2022-07-12 18:14:02.99841	2022-07-12 18:14:02.99841
285	8	26	23	2022-07-12 18:14:03.007952	2022-07-12 18:14:03.007952
286	21	26	24	2022-07-12 18:14:03.024857	2022-07-12 18:14:03.024857
287	83	26	25	2022-07-12 18:14:03.035249	2022-07-12 18:14:03.035249
288	59	26	26	2022-07-12 18:14:03.04518	2022-07-12 18:14:03.04518
289	3	26	27	2022-07-12 18:14:03.054455	2022-07-12 18:14:03.054455
290	57	26	28	2022-07-12 18:14:03.06413	2022-07-12 18:14:03.06413
291	54	26	29	2022-07-12 18:14:03.073578	2022-07-12 18:14:03.073578
292	27	26	30	2022-07-12 18:14:03.082891	2022-07-12 18:14:03.082891
293	64	21	1	2022-07-12 18:14:03.826269	2022-07-12 18:14:03.826269
294	40	21	2	2022-07-12 18:14:03.836932	2022-07-12 18:14:03.836932
295	57	21	3	2022-07-12 18:14:03.846425	2022-07-12 18:14:03.846425
296	68	21	4	2022-07-12 18:14:03.856057	2022-07-12 18:14:03.856057
297	106	21	5	2022-07-12 18:14:03.865102	2022-07-12 18:14:03.865102
298	102	21	6	2022-07-12 18:14:03.874178	2022-07-12 18:14:03.874178
299	25	21	7	2022-07-12 18:14:03.88388	2022-07-12 18:14:03.88388
300	99	21	8	2022-07-12 18:14:03.896429	2022-07-12 18:14:03.896429
301	110	21	9	2022-07-12 18:14:03.90832	2022-07-12 18:14:03.90832
302	48	21	10	2022-07-12 18:14:03.92083	2022-07-12 18:14:03.92083
303	26	21	11	2022-07-12 18:14:03.931236	2022-07-12 18:14:03.931236
304	100	21	12	2022-07-12 18:14:03.941431	2022-07-12 18:14:03.941431
305	111	21	13	2022-07-12 18:14:03.951265	2022-07-12 18:14:03.951265
306	93	21	14	2022-07-12 18:14:03.960286	2022-07-12 18:14:03.960286
307	108	21	15	2022-07-12 18:14:03.97012	2022-07-12 18:14:03.97012
308	60	21	16	2022-07-12 18:14:03.979708	2022-07-12 18:14:03.979708
309	47	21	17	2022-07-12 18:14:03.988704	2022-07-12 18:14:03.988704
310	32	21	18	2022-07-12 18:14:04.000672	2022-07-12 18:14:04.000672
311	20	21	19	2022-07-12 18:14:04.011611	2022-07-12 18:14:04.011611
312	63	21	20	2022-07-12 18:14:04.024074	2022-07-12 18:14:04.024074
313	112	21	21	2022-07-12 18:14:04.034901	2022-07-12 18:14:04.034901
314	39	21	22	2022-07-12 18:14:04.044254	2022-07-12 18:14:04.044254
315	13	21	23	2022-07-12 18:14:04.054499	2022-07-12 18:14:04.054499
316	14	21	24	2022-07-12 18:14:04.064216	2022-07-12 18:14:04.064216
317	52	21	25	2022-07-12 18:14:04.073595	2022-07-12 18:14:04.073595
318	90	21	26	2022-07-12 18:14:04.085145	2022-07-12 18:14:04.085145
319	45	21	27	2022-07-12 18:14:04.096028	2022-07-12 18:14:04.096028
320	55	21	28	2022-07-12 18:14:04.106135	2022-07-12 18:14:04.106135
321	91	21	29	2022-07-12 18:14:04.115438	2022-07-12 18:14:04.115438
322	115	21	30	2022-07-12 18:14:04.124266	2022-07-12 18:14:04.124266
323	65	18	1	2022-07-12 18:14:04.924408	2022-07-12 18:14:04.924408
324	38	18	2	2022-07-12 18:14:04.934369	2022-07-12 18:14:04.934369
325	35	18	3	2022-07-12 18:14:04.944209	2022-07-12 18:14:04.944209
326	85	18	4	2022-07-12 18:14:04.953822	2022-07-12 18:14:04.953822
327	91	18	5	2022-07-12 18:14:04.963919	2022-07-12 18:14:04.963919
328	102	18	6	2022-07-12 18:14:04.973377	2022-07-12 18:14:04.973377
329	15	18	7	2022-07-12 18:14:04.983094	2022-07-12 18:14:04.983094
330	16	18	8	2022-07-12 18:14:04.992322	2022-07-12 18:14:04.992322
331	84	18	9	2022-07-12 18:14:05.001893	2022-07-12 18:14:05.001893
332	93	18	10	2022-07-12 18:14:05.01113	2022-07-12 18:14:05.01113
333	70	18	11	2022-07-12 18:14:05.022882	2022-07-12 18:14:05.022882
334	50	18	12	2022-07-12 18:14:05.033157	2022-07-12 18:14:05.033157
335	101	18	13	2022-07-12 18:14:05.043582	2022-07-12 18:14:05.043582
336	12	18	14	2022-07-12 18:14:05.053197	2022-07-12 18:14:05.053197
337	28	18	15	2022-07-12 18:14:05.0629	2022-07-12 18:14:05.0629
338	40	18	16	2022-07-12 18:14:05.072292	2022-07-12 18:14:05.072292
339	47	18	17	2022-07-12 18:14:05.083054	2022-07-12 18:14:05.083054
340	51	18	18	2022-07-12 18:14:05.093516	2022-07-12 18:14:05.093516
341	92	18	19	2022-07-12 18:14:05.103502	2022-07-12 18:14:05.103502
342	3	18	20	2022-07-12 18:14:05.113312	2022-07-12 18:14:05.113312
343	37	18	21	2022-07-12 18:14:05.122848	2022-07-12 18:14:05.122848
344	71	18	22	2022-07-12 18:14:05.131561	2022-07-12 18:14:05.131561
345	39	18	23	2022-07-12 18:14:05.141065	2022-07-12 18:14:05.141065
346	44	18	24	2022-07-12 18:14:05.150063	2022-07-12 18:14:05.150063
347	107	18	25	2022-07-12 18:14:05.159014	2022-07-12 18:14:05.159014
348	94	18	26	2022-07-12 18:14:05.167574	2022-07-12 18:14:05.167574
349	56	18	27	2022-07-12 18:14:05.177502	2022-07-12 18:14:05.177502
350	2	18	28	2022-07-12 18:14:05.186768	2022-07-12 18:14:05.186768
351	31	18	29	2022-07-12 18:14:05.196562	2022-07-12 18:14:05.196562
352	10	18	30	2022-07-12 18:14:05.20602	2022-07-12 18:14:05.20602
353	41	24	1	2022-07-12 18:14:06.081233	2022-07-12 18:14:06.081233
354	104	24	2	2022-07-12 18:14:06.091139	2022-07-12 18:14:06.091139
355	72	24	3	2022-07-12 18:14:06.136887	2022-07-12 18:14:06.136887
356	66	24	4	2022-07-12 18:14:06.149326	2022-07-12 18:14:06.149326
357	13	24	5	2022-07-12 18:14:06.159327	2022-07-12 18:14:06.159327
358	59	24	6	2022-07-12 18:14:06.169172	2022-07-12 18:14:06.169172
359	97	24	7	2022-07-12 18:14:06.17908	2022-07-12 18:14:06.17908
360	92	24	8	2022-07-12 18:14:06.218337	2022-07-12 18:14:06.218337
361	64	24	9	2022-07-12 18:14:06.23312	2022-07-12 18:14:06.23312
362	114	24	10	2022-07-12 18:14:06.243418	2022-07-12 18:14:06.243418
363	34	24	11	2022-07-12 18:14:06.253266	2022-07-12 18:14:06.253266
364	55	24	12	2022-07-12 18:14:06.263353	2022-07-12 18:14:06.263353
365	110	24	13	2022-07-12 18:14:06.274098	2022-07-12 18:14:06.274098
366	98	24	14	2022-07-12 18:14:06.28477	2022-07-12 18:14:06.28477
367	44	24	15	2022-07-12 18:14:06.296091	2022-07-12 18:14:06.296091
368	8	24	16	2022-07-12 18:14:06.305765	2022-07-12 18:14:06.305765
369	40	24	17	2022-07-12 18:14:06.315982	2022-07-12 18:14:06.315982
370	20	24	18	2022-07-12 18:14:06.325795	2022-07-12 18:14:06.325795
371	46	24	19	2022-07-12 18:14:06.335688	2022-07-12 18:14:06.335688
372	115	24	20	2022-07-12 18:14:06.345457	2022-07-12 18:14:06.345457
373	15	24	21	2022-07-12 18:14:06.355005	2022-07-12 18:14:06.355005
374	30	24	22	2022-07-12 18:14:06.364527	2022-07-12 18:14:06.364527
375	53	24	23	2022-07-12 18:14:06.374341	2022-07-12 18:14:06.374341
376	57	24	24	2022-07-12 18:14:06.384161	2022-07-12 18:14:06.384161
377	31	24	25	2022-07-12 18:14:06.39512	2022-07-12 18:14:06.39512
378	32	24	26	2022-07-12 18:14:06.404978	2022-07-12 18:14:06.404978
379	37	24	27	2022-07-12 18:14:06.415181	2022-07-12 18:14:06.415181
380	103	24	28	2022-07-12 18:14:06.424546	2022-07-12 18:14:06.424546
381	14	24	29	2022-07-12 18:14:06.434337	2022-07-12 18:14:06.434337
382	71	24	30	2022-07-12 18:14:06.44397	2022-07-12 18:14:06.44397
383	1	19	1	2022-07-12 18:14:07.448266	2022-07-12 18:14:07.448266
384	9	19	2	2022-07-12 18:14:07.458324	2022-07-12 18:14:07.458324
385	113	19	3	2022-07-12 18:14:07.468943	2022-07-12 18:14:07.468943
386	27	19	4	2022-07-12 18:14:07.4785	2022-07-12 18:14:07.4785
387	50	19	5	2022-07-12 18:14:07.488242	2022-07-12 18:14:07.488242
388	13	19	6	2022-07-12 18:14:07.497833	2022-07-12 18:14:07.497833
389	94	19	7	2022-07-12 18:14:07.509527	2022-07-12 18:14:07.509527
390	74	19	8	2022-07-12 18:14:07.524205	2022-07-12 18:14:07.524205
391	112	19	9	2022-07-12 18:14:07.535638	2022-07-12 18:14:07.535638
392	85	19	10	2022-07-12 18:14:07.546457	2022-07-12 18:14:07.546457
393	10	19	11	2022-07-12 18:14:07.578691	2022-07-12 18:14:07.578691
394	3	19	12	2022-07-12 18:14:07.593013	2022-07-12 18:14:07.593013
395	110	19	13	2022-07-12 18:14:07.604136	2022-07-12 18:14:07.604136
396	72	19	14	2022-07-12 18:14:07.614245	2022-07-12 18:14:07.614245
397	100	19	15	2022-07-12 18:14:07.624442	2022-07-12 18:14:07.624442
398	48	19	16	2022-07-12 18:14:07.634071	2022-07-12 18:14:07.634071
399	34	19	17	2022-07-12 18:14:07.644189	2022-07-12 18:14:07.644189
400	87	19	18	2022-07-12 18:14:07.654764	2022-07-12 18:14:07.654764
401	107	19	19	2022-07-12 18:14:07.66499	2022-07-12 18:14:07.66499
402	80	19	20	2022-07-12 18:14:07.674968	2022-07-12 18:14:07.674968
403	73	19	21	2022-07-12 18:14:07.684989	2022-07-12 18:14:07.684989
404	28	19	22	2022-07-12 18:14:07.69548	2022-07-12 18:14:07.69548
405	12	19	23	2022-07-12 18:14:07.705987	2022-07-12 18:14:07.705987
406	18	19	24	2022-07-12 18:14:07.71551	2022-07-12 18:14:07.71551
407	70	19	25	2022-07-12 18:14:07.725503	2022-07-12 18:14:07.725503
408	92	19	26	2022-07-12 18:14:07.736598	2022-07-12 18:14:07.736598
409	39	19	27	2022-07-12 18:14:07.746635	2022-07-12 18:14:07.746635
410	93	19	28	2022-07-12 18:14:07.756459	2022-07-12 18:14:07.756459
411	31	19	29	2022-07-12 18:14:07.766841	2022-07-12 18:14:07.766841
412	99	19	30	2022-07-12 18:14:07.77684	2022-07-12 18:14:07.77684
413	77	22	1	2022-07-12 18:14:08.753657	2022-07-12 18:14:08.753657
414	95	22	2	2022-07-12 18:14:08.762689	2022-07-12 18:14:08.762689
415	40	22	3	2022-07-12 18:14:08.77215	2022-07-12 18:14:08.77215
416	66	22	4	2022-07-12 18:14:08.781071	2022-07-12 18:14:08.781071
417	116	22	5	2022-07-12 18:14:08.790128	2022-07-12 18:14:08.790128
418	70	22	6	2022-07-12 18:14:08.799348	2022-07-12 18:14:08.799348
419	87	22	7	2022-07-12 18:14:08.808152	2022-07-12 18:14:08.808152
420	97	22	8	2022-07-12 18:14:08.817068	2022-07-12 18:14:08.817068
421	112	22	9	2022-07-12 18:14:08.826861	2022-07-12 18:14:08.826861
422	28	22	10	2022-07-12 18:14:08.836355	2022-07-12 18:14:08.836355
423	64	22	11	2022-07-12 18:14:08.845171	2022-07-12 18:14:08.845171
424	47	22	12	2022-07-12 18:14:08.854864	2022-07-12 18:14:08.854864
425	44	22	13	2022-07-12 18:14:08.864189	2022-07-12 18:14:08.864189
426	16	22	14	2022-07-12 18:14:08.873235	2022-07-12 18:14:08.873235
427	93	22	15	2022-07-12 18:14:08.88198	2022-07-12 18:14:08.88198
428	11	22	16	2022-07-12 18:14:08.890902	2022-07-12 18:14:08.890902
429	45	22	17	2022-07-12 18:14:08.899667	2022-07-12 18:14:08.899667
430	59	22	18	2022-07-12 18:14:08.90862	2022-07-12 18:14:08.90862
431	29	22	19	2022-07-12 18:14:08.917862	2022-07-12 18:14:08.917862
432	10	22	20	2022-07-12 18:14:08.92632	2022-07-12 18:14:08.92632
433	74	22	21	2022-07-12 18:14:08.935259	2022-07-12 18:14:08.935259
434	88	22	22	2022-07-12 18:14:08.944174	2022-07-12 18:14:08.944174
435	83	22	23	2022-07-12 18:14:08.952429	2022-07-12 18:14:08.952429
436	36	22	24	2022-07-12 18:14:08.960501	2022-07-12 18:14:08.960501
437	75	22	25	2022-07-12 18:14:08.969208	2022-07-12 18:14:08.969208
438	71	22	26	2022-07-12 18:14:08.977299	2022-07-12 18:14:08.977299
439	22	22	27	2022-07-12 18:14:08.986202	2022-07-12 18:14:08.986202
440	9	22	28	2022-07-12 18:14:08.995019	2022-07-12 18:14:08.995019
441	26	22	29	2022-07-12 18:14:09.003602	2022-07-12 18:14:09.003602
442	55	22	30	2022-07-12 18:14:09.012216	2022-07-12 18:14:09.012216
\.


--
-- Data for Name: spree_promotion_action_line_items; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.spree_promotion_action_line_items (id, promotion_action_id, variant_id, quantity, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: spree_promotion_actions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.spree_promotion_actions (id, promotion_id, "position", type, deleted_at, created_at, updated_at) FROM stdin;
1	1	\N	Spree::Promotion::Actions::FreeShipping	\N	2022-07-12 18:14:10.844503	2022-07-12 18:14:10.844503
\.


--
-- Data for Name: spree_promotion_categories; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.spree_promotion_categories (id, name, created_at, updated_at, code) FROM stdin;
\.


--
-- Data for Name: spree_promotion_rule_taxons; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.spree_promotion_rule_taxons (id, taxon_id, promotion_rule_id, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: spree_promotion_rule_users; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.spree_promotion_rule_users (id, user_id, promotion_rule_id, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: spree_promotion_rules; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.spree_promotion_rules (id, promotion_id, user_id, product_group_id, type, created_at, updated_at, code, preferences) FROM stdin;
1	1	\N	\N	Spree::Promotion::Rules::OptionValue	2022-07-12 18:14:10.81453	2022-07-12 18:14:10.81453	\N	---\n:eligible_values:\n  '1': '23,3'\n:match_policy: any\n
\.


--
-- Data for Name: spree_promotions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.spree_promotions (id, description, expires_at, starts_at, name, type, usage_limit, match_policy, code, advertise, path, created_at, updated_at, promotion_category_id, public_metadata, private_metadata) FROM stdin;
1		\N	\N	free shipping	\N	\N	any	\N	f	\N	2022-07-12 18:14:10.64848	2022-07-12 18:14:10.678912	\N	\N	\N
\.


--
-- Data for Name: spree_promotions_stores; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.spree_promotions_stores (id, promotion_id, store_id, created_at, updated_at) FROM stdin;
1	1	1	2022-07-12 18:14:10.657425	2022-07-12 18:14:10.657425
2	1	2	2022-07-12 18:14:10.668288	2022-07-12 18:14:10.668288
3	1	3	2022-07-12 18:14:10.675654	2022-07-12 18:14:10.675654
\.


--
-- Data for Name: spree_properties; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.spree_properties (id, name, presentation, created_at, updated_at, filterable, filter_param, public_metadata, private_metadata) FROM stdin;
7	fit	Fit	2022-07-12 18:14:11.177046	2022-07-12 18:15:11.864342	f	fit	\N	\N
8	gender	Gender	2022-07-12 18:14:11.220511	2022-07-12 18:15:11.9277	f	gender	\N	\N
9	type	type	2022-07-12 18:14:18.692257	2022-07-12 18:15:12.065223	f	type	\N	\N
10	collection	collection	2022-07-12 18:14:18.741137	2022-07-12 18:15:12.123284	f	collection	\N	\N
6	material	Material	2022-07-12 18:14:11.131286	2022-07-12 18:15:12.283938	f	material	\N	\N
3	model	Model	2022-07-12 18:14:10.990963	2022-07-12 18:15:12.367256	f	model	\N	\N
11	made_from	Made from	2022-07-12 18:15:12.434047	2022-07-12 18:15:12.434047	f	made_from	\N	\N
12	type	Type	2022-07-12 18:15:12.449715	2022-07-12 18:15:12.449715	f	type	\N	\N
13	size	Size	2022-07-12 18:15:12.461444	2022-07-12 18:15:12.461444	f	size	\N	\N
14	length	Lenght	2022-07-12 18:15:12.474625	2022-07-12 18:15:12.474625	f	length	\N	\N
15	color	Color	2022-07-12 18:15:12.486094	2022-07-12 18:15:12.486094	f	color	\N	\N
16	collection	Collection	2022-07-12 18:15:12.49772	2022-07-12 18:15:12.49772	f	collection	\N	\N
1	manufacturer	Manufacturer	2022-07-12 18:14:10.879153	2022-07-12 18:15:12.508187	t	manufacturer	\N	\N
2	brand	Brand	2022-07-12 18:14:10.947028	2022-07-12 18:15:12.52262	t	brand	\N	\N
4	shirt_type	Shirt type	2022-07-12 18:14:11.035921	2022-07-12 18:14:18.406625	f	shirt_type	\N	\N
5	sleeve_type	Sleeve type	2022-07-12 18:14:11.08378	2022-07-12 18:14:18.457435	f	sleeve_type	\N	\N
\.


--
-- Data for Name: spree_property_prototypes; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.spree_property_prototypes (id, prototype_id, property_id, created_at, updated_at) FROM stdin;
1	1	1	2022-07-12 18:15:12.586831	2022-07-12 18:15:12.586831
2	1	2	2022-07-12 18:15:12.601081	2022-07-12 18:15:12.601081
3	1	3	2022-07-12 18:15:12.614942	2022-07-12 18:15:12.614942
4	1	14	2022-07-12 18:15:12.628837	2022-07-12 18:15:12.628837
5	1	11	2022-07-12 18:15:12.64238	2022-07-12 18:15:12.64238
6	1	6	2022-07-12 18:15:12.655098	2022-07-12 18:15:12.655098
7	1	7	2022-07-12 18:15:12.669658	2022-07-12 18:15:12.669658
8	1	8	2022-07-12 18:15:12.684844	2022-07-12 18:15:12.684844
9	2	12	2022-07-12 18:15:12.710267	2022-07-12 18:15:12.710267
10	2	13	2022-07-12 18:15:12.723704	2022-07-12 18:15:12.723704
11	2	6	2022-07-12 18:15:12.736991	2022-07-12 18:15:12.736991
12	3	13	2022-07-12 18:15:12.765498	2022-07-12 18:15:12.765498
13	3	12	2022-07-12 18:15:12.779121	2022-07-12 18:15:12.779121
\.


--
-- Data for Name: spree_prototype_taxons; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.spree_prototype_taxons (id, taxon_id, prototype_id, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: spree_prototypes; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.spree_prototypes (id, name, created_at, updated_at, public_metadata, private_metadata) FROM stdin;
1	Shirt	2022-07-12 18:15:12.550256	2022-07-12 18:15:12.550256	\N	\N
2	Bag	2022-07-12 18:15:12.691724	2022-07-12 18:15:12.691724	\N	\N
3	Mugs	2022-07-12 18:15:12.744761	2022-07-12 18:15:12.744761	\N	\N
\.


--
-- Data for Name: spree_refund_reasons; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.spree_refund_reasons (id, name, active, mutable, created_at, updated_at) FROM stdin;
1	Return processing	t	f	2022-07-12 18:10:12.374693	2022-07-12 18:10:12.374693
\.


--
-- Data for Name: spree_refunds; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.spree_refunds (id, payment_id, amount, transaction_id, created_at, updated_at, refund_reason_id, reimbursement_id, public_metadata, private_metadata) FROM stdin;
\.


--
-- Data for Name: spree_reimbursement_credits; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.spree_reimbursement_credits (id, amount, reimbursement_id, creditable_id, creditable_type, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: spree_reimbursement_types; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.spree_reimbursement_types (id, name, active, mutable, created_at, updated_at, type) FROM stdin;
\.


--
-- Data for Name: spree_reimbursements; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.spree_reimbursements (id, number, reimbursement_status, customer_return_id, order_id, total, created_at, updated_at) FROM stdin;
1	RI109591719	pending	\N	1	\N	2022-07-12 18:15:54.389019	2022-07-12 18:15:54.389019
\.


--
-- Data for Name: spree_return_authorization_reasons; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.spree_return_authorization_reasons (id, name, active, mutable, created_at, updated_at) FROM stdin;
1	Better price available	t	t	2022-07-12 18:15:54.422179	2022-07-12 18:15:54.422179
2	Missed estimated delivery date	t	t	2022-07-12 18:15:54.43343	2022-07-12 18:15:54.43343
3	Missing parts or accessories	t	t	2022-07-12 18:15:54.44452	2022-07-12 18:15:54.44452
4	Damaged/Defective	t	t	2022-07-12 18:15:54.456162	2022-07-12 18:15:54.456162
5	Different from what was ordered	t	t	2022-07-12 18:15:54.467092	2022-07-12 18:15:54.467092
6	Different from description	t	t	2022-07-12 18:15:54.477401	2022-07-12 18:15:54.477401
7	No longer needed/wanted	t	t	2022-07-12 18:15:54.488238	2022-07-12 18:15:54.488238
8	Accidental order	t	t	2022-07-12 18:15:54.498187	2022-07-12 18:15:54.498187
9	Unauthorized purchase	t	t	2022-07-12 18:15:54.508012	2022-07-12 18:15:54.508012
\.


--
-- Data for Name: spree_return_authorizations; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.spree_return_authorizations (id, number, state, order_id, memo, created_at, updated_at, stock_location_id, return_authorization_reason_id) FROM stdin;
\.


--
-- Data for Name: spree_return_items; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.spree_return_items (id, return_authorization_id, inventory_unit_id, exchange_variant_id, created_at, updated_at, pre_tax_amount, included_tax_total, additional_tax_total, reception_status, acceptance_status, customer_return_id, reimbursement_id, acceptance_status_errors, preferred_reimbursement_type_id, override_reimbursement_type_id, resellable) FROM stdin;
\.


--
-- Data for Name: spree_role_users; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.spree_role_users (id, role_id, user_id, created_at, updated_at) FROM stdin;
1	1	1	2022-07-12 18:10:57.986839	2022-07-12 18:10:57.986839
\.


--
-- Data for Name: spree_roles; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.spree_roles (id, name, created_at, updated_at) FROM stdin;
1	admin	2022-07-12 18:10:12.358597	2022-07-12 18:10:12.358597
\.


--
-- Data for Name: spree_shipments; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.spree_shipments (id, tracking, number, cost, shipped_at, order_id, address_id, state, created_at, updated_at, stock_location_id, adjustment_total, additional_tax_total, promo_total, included_tax_total, pre_tax_amount, taxable_adjustment_total, non_taxable_adjustment_total, public_metadata, private_metadata) FROM stdin;
1	\N	H74722885856	0.00	\N	1	\N	pending	2022-07-12 18:15:53.03655	2022-07-12 18:15:53.776378	1	0.00	0.00	0.00	0.00	0.0000	0.00	0.00	\N	\N
2	\N	H15721246649	5.00	\N	2	1	pending	2022-07-12 18:15:53.227324	2022-07-12 18:15:54.330427	1	0.00	0.00	0.00	0.00	0.0000	0.00	0.00	\N	\N
\.


--
-- Data for Name: spree_shipping_categories; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.spree_shipping_categories (id, name, created_at, updated_at) FROM stdin;
1	Default	2022-07-12 18:10:15.09237	2022-07-12 18:10:15.09237
2	Digital	2022-07-12 18:10:15.103953	2022-07-12 18:10:15.103953
\.


--
-- Data for Name: spree_shipping_method_categories; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.spree_shipping_method_categories (id, shipping_method_id, shipping_category_id, created_at, updated_at) FROM stdin;
1	1	1	2022-07-12 18:13:10.15444	2022-07-12 18:13:10.15444
2	2	1	2022-07-12 18:13:10.191973	2022-07-12 18:13:10.191973
3	3	1	2022-07-12 18:13:10.226458	2022-07-12 18:13:10.226458
4	4	1	2022-07-12 18:13:10.262018	2022-07-12 18:13:10.262018
5	5	1	2022-07-12 18:13:10.297927	2022-07-12 18:13:10.297927
\.


--
-- Data for Name: spree_shipping_method_zones; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.spree_shipping_method_zones (id, shipping_method_id, zone_id, created_at, updated_at) FROM stdin;
1	1	3	2022-07-12 18:13:10.157988	2022-07-12 18:13:10.157988
2	2	3	2022-07-12 18:13:10.194789	2022-07-12 18:13:10.194789
3	3	3	2022-07-12 18:13:10.22893	2022-07-12 18:13:10.22893
4	4	1	2022-07-12 18:13:10.26488	2022-07-12 18:13:10.26488
5	5	1	2022-07-12 18:13:10.300373	2022-07-12 18:13:10.300373
\.


--
-- Data for Name: spree_shipping_methods; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.spree_shipping_methods (id, name, display_on, deleted_at, created_at, updated_at, tracking_url, admin_name, tax_category_id, code, public_metadata, private_metadata) FROM stdin;
1	UPS Ground (USD)	both	\N	2022-07-12 18:13:10.148512	2022-07-12 18:13:10.148512	\N	\N	\N	\N	\N	\N
2	UPS Two Day (USD)	both	\N	2022-07-12 18:13:10.186897	2022-07-12 18:13:10.186897	\N	\N	\N	\N	\N	\N
3	UPS One Day (USD)	both	\N	2022-07-12 18:13:10.221522	2022-07-12 18:13:10.221522	\N	\N	\N	\N	\N	\N
4	UPS Ground (EU)	both	\N	2022-07-12 18:13:10.256766	2022-07-12 18:13:10.256766	\N	\N	\N	\N	\N	\N
5	UPS Ground (EUR)	both	\N	2022-07-12 18:13:10.29214	2022-07-12 18:13:10.29214	\N	\N	\N	\N	\N	\N
\.


--
-- Data for Name: spree_shipping_rates; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.spree_shipping_rates (id, shipment_id, shipping_method_id, selected, cost, created_at, updated_at, tax_rate_id) FROM stdin;
8	2	2	f	10.00	2022-07-12 18:15:54.29679	2022-07-12 18:15:54.29679	\N
9	2	3	f	15.00	2022-07-12 18:15:54.300032	2022-07-12 18:15:54.300032	\N
7	2	1	t	5.00	2022-07-12 18:15:54.29292	2022-07-12 18:15:54.312818	\N
\.


--
-- Data for Name: spree_state_changes; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.spree_state_changes (id, name, previous_state, stateful_id, user_id, stateful_type, next_state, created_at, updated_at) FROM stdin;
1	payment	\N	1	\N	Spree::Order	balance_due	2022-07-12 18:15:53.658515	2022-07-12 18:15:53.658515
2	shipment	\N	1	\N	Spree::Order	pending	2022-07-12 18:15:53.685851	2022-07-12 18:15:53.685851
3	payment	\N	2	\N	Spree::Order	balance_due	2022-07-12 18:15:53.868839	2022-07-12 18:15:53.868839
4	shipment	\N	2	\N	Spree::Order	pending	2022-07-12 18:15:54.099286	2022-07-12 18:15:54.099286
\.


--
-- Data for Name: spree_states; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.spree_states (id, name, abbr, country_id, updated_at, created_at) FROM stdin;
1	Australian Capital Territory	ACT	12	2022-07-12 18:10:03.904685	2022-07-12 18:10:03.904685
2	New South Wales	NSW	12	2022-07-12 18:10:03.91859	2022-07-12 18:10:03.91859
3	Northern Territory	NT	12	2022-07-12 18:10:03.933122	2022-07-12 18:10:03.933122
4	Queensland	QLD	12	2022-07-12 18:10:03.946611	2022-07-12 18:10:03.946611
5	South Australia	SA	12	2022-07-12 18:10:03.960084	2022-07-12 18:10:03.960084
6	Tasmania	TAS	12	2022-07-12 18:10:03.974088	2022-07-12 18:10:03.974088
7	Victoria	VIC	12	2022-07-12 18:10:03.987587	2022-07-12 18:10:03.987587
8	Western Australia	WA	12	2022-07-12 18:10:04.003262	2022-07-12 18:10:04.003262
9	Acre	AC	29	2022-07-12 18:10:04.021072	2022-07-12 18:10:04.021072
10	Alagoas	AL	29	2022-07-12 18:10:04.033647	2022-07-12 18:10:04.033647
11	Amazonas	AM	29	2022-07-12 18:10:04.046443	2022-07-12 18:10:04.046443
12	Amapá	AP	29	2022-07-12 18:10:04.059442	2022-07-12 18:10:04.059442
13	Bahia	BA	29	2022-07-12 18:10:04.073319	2022-07-12 18:10:04.073319
14	Ceará	CE	29	2022-07-12 18:10:04.086624	2022-07-12 18:10:04.086624
15	Distrito Federal	DF	29	2022-07-12 18:10:04.100519	2022-07-12 18:10:04.100519
16	Espírito Santo	ES	29	2022-07-12 18:10:04.127679	2022-07-12 18:10:04.127679
17	Goiás	GO	29	2022-07-12 18:10:04.142972	2022-07-12 18:10:04.142972
18	Maranhão	MA	29	2022-07-12 18:10:04.157073	2022-07-12 18:10:04.157073
19	Minas Gerais	MG	29	2022-07-12 18:10:04.170175	2022-07-12 18:10:04.170175
20	Mato Grosso do Sul	MS	29	2022-07-12 18:10:04.183469	2022-07-12 18:10:04.183469
21	Mato Grosso	MT	29	2022-07-12 18:10:04.197014	2022-07-12 18:10:04.197014
22	Pará	PA	29	2022-07-12 18:10:04.211094	2022-07-12 18:10:04.211094
23	Paraíba	PB	29	2022-07-12 18:10:04.225311	2022-07-12 18:10:04.225311
24	Pernambuco	PE	29	2022-07-12 18:10:04.239088	2022-07-12 18:10:04.239088
25	Piauí	PI	29	2022-07-12 18:10:04.254286	2022-07-12 18:10:04.254286
26	Paraná	PR	29	2022-07-12 18:10:04.268099	2022-07-12 18:10:04.268099
27	Rio de Janeiro	RJ	29	2022-07-12 18:10:04.281361	2022-07-12 18:10:04.281361
28	Rio Grande do Norte	RN	29	2022-07-12 18:10:04.295464	2022-07-12 18:10:04.295464
29	Rondônia	RO	29	2022-07-12 18:10:04.309521	2022-07-12 18:10:04.309521
30	Roraima	RR	29	2022-07-12 18:10:04.323295	2022-07-12 18:10:04.323295
31	Rio Grande do Sul	RS	29	2022-07-12 18:10:04.337416	2022-07-12 18:10:04.337416
32	Santa Catarina	SC	29	2022-07-12 18:10:04.353147	2022-07-12 18:10:04.353147
33	Sergipe	SE	29	2022-07-12 18:10:04.366881	2022-07-12 18:10:04.366881
34	São Paulo	SP	29	2022-07-12 18:10:04.380504	2022-07-12 18:10:04.380504
35	Tocantins	TO	29	2022-07-12 18:10:04.394767	2022-07-12 18:10:04.394767
36	Alberta	AB	35	2022-07-12 18:10:04.411696	2022-07-12 18:10:04.411696
37	British Columbia	BC	35	2022-07-12 18:10:04.425031	2022-07-12 18:10:04.425031
38	Manitoba	MB	35	2022-07-12 18:10:04.438458	2022-07-12 18:10:04.438458
39	New Brunswick	NB	35	2022-07-12 18:10:04.453485	2022-07-12 18:10:04.453485
40	Newfoundland and Labrador	NL	35	2022-07-12 18:10:04.467574	2022-07-12 18:10:04.467574
41	Nova Scotia	NS	35	2022-07-12 18:10:04.485195	2022-07-12 18:10:04.485195
42	Northwest Territories	NT	35	2022-07-12 18:10:04.50051	2022-07-12 18:10:04.50051
43	Nunavut	NU	35	2022-07-12 18:10:04.515089	2022-07-12 18:10:04.515089
44	Ontario	ON	35	2022-07-12 18:10:04.528423	2022-07-12 18:10:04.528423
45	Prince Edward Island	PE	35	2022-07-12 18:10:04.542179	2022-07-12 18:10:04.542179
46	Quebec	QC	35	2022-07-12 18:10:04.555858	2022-07-12 18:10:04.555858
47	Saskatchewan	SK	35	2022-07-12 18:10:04.569233	2022-07-12 18:10:04.569233
48	Yukon Territory	YT	35	2022-07-12 18:10:04.585037	2022-07-12 18:10:04.585037
49	Anhui Sheng	AH	45	2022-07-12 18:10:04.603327	2022-07-12 18:10:04.603327
50	Beijing Shi	BJ	45	2022-07-12 18:10:04.61654	2022-07-12 18:10:04.61654
51	Chongqing Shi	CQ	45	2022-07-12 18:10:04.629567	2022-07-12 18:10:04.629567
52	Fujian Sheng	FJ	45	2022-07-12 18:10:04.642945	2022-07-12 18:10:04.642945
53	Guangdong Sheng	GD	45	2022-07-12 18:10:04.656237	2022-07-12 18:10:04.656237
54	Gansu Sheng	GS	45	2022-07-12 18:10:04.669703	2022-07-12 18:10:04.669703
55	Guangxi Zhuangzu Zizhiqu	GX	45	2022-07-12 18:10:04.684004	2022-07-12 18:10:04.684004
56	Guizhou Sheng	GZ	45	2022-07-12 18:10:04.697871	2022-07-12 18:10:04.697871
57	Henan Sheng	HA	45	2022-07-12 18:10:04.712288	2022-07-12 18:10:04.712288
58	Hubei Sheng	HB	45	2022-07-12 18:10:04.726045	2022-07-12 18:10:04.726045
59	Hebei Sheng	HE	45	2022-07-12 18:10:04.739409	2022-07-12 18:10:04.739409
60	Hainan Sheng	HI	45	2022-07-12 18:10:04.75225	2022-07-12 18:10:04.75225
61	Heilongjiang Sheng	HL	45	2022-07-12 18:10:04.766103	2022-07-12 18:10:04.766103
62	Hunan Sheng	HN	45	2022-07-12 18:10:04.779252	2022-07-12 18:10:04.779252
63	Jilin Sheng	JL	45	2022-07-12 18:10:04.793026	2022-07-12 18:10:04.793026
64	Jiangsu Sheng	JS	45	2022-07-12 18:10:04.807831	2022-07-12 18:10:04.807831
65	Jiangxi Sheng	JX	45	2022-07-12 18:10:04.821212	2022-07-12 18:10:04.821212
66	Liaoning Sheng	LN	45	2022-07-12 18:10:04.83938	2022-07-12 18:10:04.83938
67	Nei Mongol Zizhiqu	NM	45	2022-07-12 18:10:04.854167	2022-07-12 18:10:04.854167
68	Ningxia Huizi Zizhiqu	NX	45	2022-07-12 18:10:04.867548	2022-07-12 18:10:04.867548
69	Qinghai Sheng	QH	45	2022-07-12 18:10:04.881493	2022-07-12 18:10:04.881493
70	Sichuan Sheng	SC	45	2022-07-12 18:10:04.895447	2022-07-12 18:10:04.895447
71	Shandong Sheng	SD	45	2022-07-12 18:10:04.90959	2022-07-12 18:10:04.90959
72	Shanghai Shi	SH	45	2022-07-12 18:10:04.924074	2022-07-12 18:10:04.924074
73	Shaanxi Sheng	SN	45	2022-07-12 18:10:04.937861	2022-07-12 18:10:04.937861
74	Shanxi Sheng	SX	45	2022-07-12 18:10:04.953914	2022-07-12 18:10:04.953914
75	Tianjin Shi	TJ	45	2022-07-12 18:10:04.968547	2022-07-12 18:10:04.968547
76	Xinjiang Uygur Zizhiqu	XJ	45	2022-07-12 18:10:04.982603	2022-07-12 18:10:04.982603
77	Xizang Zizhiqu	XZ	45	2022-07-12 18:10:04.996923	2022-07-12 18:10:04.996923
78	Yunnan Sheng	YN	45	2022-07-12 18:10:05.010423	2022-07-12 18:10:05.010423
79	Zhejiang Sheng	ZJ	45	2022-07-12 18:10:05.025392	2022-07-12 18:10:05.025392
80	Almería	AL	64	\N	\N
81	Cádiz	CA	64	\N	\N
82	Córdoba	CO	64	\N	\N
83	Granada	GR	64	\N	\N
84	Huelva	H	64	\N	\N
85	Jaén	J	64	\N	\N
86	Málaga	MA	64	\N	\N
87	Sevilla	SE	64	\N	\N
88	Huesca	HU	64	\N	\N
89	Teruel	TE	64	\N	\N
90	Zaragoza	Z	64	\N	\N
91	Asturias	O	64	\N	\N
92	Cantabria	S	64	\N	\N
93	Ceuta	CE	64	2022-07-12 18:10:05.058286	2022-07-12 18:10:05.058286
94	Ávila	AV	64	\N	\N
95	Burgos	BU	64	\N	\N
96	León	LE	64	\N	\N
97	Palencia	P	64	\N	\N
98	Salamanca	SA	64	\N	\N
99	Segovia	SG	64	\N	\N
100	Soria	SO	64	\N	\N
101	Valladolid	VA	64	\N	\N
102	Zamora	ZA	64	\N	\N
103	Albacete	AB	64	\N	\N
104	Ciudad Real	CR	64	\N	\N
105	Cuenca	CU	64	\N	\N
106	Guadalajara	GU	64	\N	\N
107	Toledo	TO	64	\N	\N
108	Las Palmas	GC	64	\N	\N
109	Santa Cruz de Tenerife	TF	64	\N	\N
110	Barcelona	B	64	\N	\N
111	Girona	GI	64	\N	\N
112	Lleida	L	64	\N	\N
113	Tarragona	T	64	\N	\N
114	Badajoz	BA	64	\N	\N
115	Cáceres	CC	64	\N	\N
116	A Coruña	C	64	\N	\N
117	Lugo	LU	64	\N	\N
118	Ourense	OR	64	\N	\N
119	Pontevedra	PO	64	\N	\N
120	Balears	PM	64	\N	\N
121	Murcia	MU	64	\N	\N
122	Madrid	M	64	\N	\N
123	Melilla	ML	64	2022-07-12 18:10:05.098759	2022-07-12 18:10:05.098759
124	Navarra / Nafarroa	NA	64	\N	\N
125	Vizcaya / Bizkaia	BI	64	\N	\N
126	Gipuzkoa	SS	64	\N	\N
127	Álava	VI	64	\N	\N
128	La Rioja	LO	64	\N	\N
129	Alicante	A	64	\N	\N
130	Castellón	CS	64	\N	\N
131	Valencia / València	V	64	\N	\N
132	Andaman and Nicobar Islands	AN	99	2022-07-12 18:10:05.129774	2022-07-12 18:10:05.129774
133	Andhra Pradesh	AP	99	2022-07-12 18:10:05.143513	2022-07-12 18:10:05.143513
134	Arunachal Pradesh	AR	99	2022-07-12 18:10:05.158031	2022-07-12 18:10:05.158031
135	Assam	AS	99	2022-07-12 18:10:05.17159	2022-07-12 18:10:05.17159
136	Bihar	BR	99	2022-07-12 18:10:05.185612	2022-07-12 18:10:05.185612
137	Chandigarh	CH	99	2022-07-12 18:10:05.203263	2022-07-12 18:10:05.203263
138	Chhattisgarh	CT	99	2022-07-12 18:10:05.218259	2022-07-12 18:10:05.218259
139	Daman and Diu	DD	99	2022-07-12 18:10:05.232146	2022-07-12 18:10:05.232146
140	Delhi	DL	99	2022-07-12 18:10:05.246379	2022-07-12 18:10:05.246379
141	Dadra and Nagar Haveli	DN	99	2022-07-12 18:10:05.261562	2022-07-12 18:10:05.261562
142	Goa	GA	99	2022-07-12 18:10:05.276627	2022-07-12 18:10:05.276627
143	Gujarat	GJ	99	2022-07-12 18:10:05.290679	2022-07-12 18:10:05.290679
144	Himachal Pradesh	HP	99	2022-07-12 18:10:05.305942	2022-07-12 18:10:05.305942
145	Haryana	HR	99	2022-07-12 18:10:05.320601	2022-07-12 18:10:05.320601
146	Jharkhand	JH	99	2022-07-12 18:10:05.334009	2022-07-12 18:10:05.334009
147	Jammu and Kashmir	JK	99	2022-07-12 18:10:05.349443	2022-07-12 18:10:05.349443
148	Karnataka	KA	99	2022-07-12 18:10:05.363588	2022-07-12 18:10:05.363588
149	Kerala	KL	99	2022-07-12 18:10:05.377625	2022-07-12 18:10:05.377625
150	Lakshadweep	LD	99	2022-07-12 18:10:05.393469	2022-07-12 18:10:05.393469
151	Maharashtra	MH	99	2022-07-12 18:10:05.435441	2022-07-12 18:10:05.435441
152	Meghalaya	ML	99	2022-07-12 18:10:05.450909	2022-07-12 18:10:05.450909
153	Manipur	MN	99	2022-07-12 18:10:05.464955	2022-07-12 18:10:05.464955
154	Madhya Pradesh	MP	99	2022-07-12 18:10:05.47949	2022-07-12 18:10:05.47949
155	Mizoram	MZ	99	2022-07-12 18:10:05.493322	2022-07-12 18:10:05.493322
156	Nagaland	NL	99	2022-07-12 18:10:05.507782	2022-07-12 18:10:05.507782
157	Odisha	OR	99	2022-07-12 18:10:05.524004	2022-07-12 18:10:05.524004
158	Punjab	PB	99	2022-07-12 18:10:05.538522	2022-07-12 18:10:05.538522
159	Puducherry	PY	99	2022-07-12 18:10:05.552303	2022-07-12 18:10:05.552303
160	Rajasthan	RJ	99	2022-07-12 18:10:05.566016	2022-07-12 18:10:05.566016
161	Sikkim	SK	99	2022-07-12 18:10:05.585255	2022-07-12 18:10:05.585255
162	Telangana	TG	99	2022-07-12 18:10:05.599573	2022-07-12 18:10:05.599573
163	Tamil Nadu	TN	99	2022-07-12 18:10:05.613692	2022-07-12 18:10:05.613692
164	Tripura	TR	99	2022-07-12 18:10:05.629824	2022-07-12 18:10:05.629824
165	Uttar Pradesh	UP	99	2022-07-12 18:10:05.646442	2022-07-12 18:10:05.646442
166	Uttarakhand	UT	99	2022-07-12 18:10:05.662855	2022-07-12 18:10:05.662855
167	West Bengal	WB	99	2022-07-12 18:10:05.677754	2022-07-12 18:10:05.677754
168	Alessandria	AL	103	\N	\N
169	Asti	AT	103	\N	\N
170	Biella	BI	103	\N	\N
171	Cuneo	CN	103	\N	\N
172	Novara	NO	103	\N	\N
173	Torino	TO	103	\N	\N
174	Verbano-Cusio-Ossola	VB	103	\N	\N
175	Vercelli	VC	103	\N	\N
176	Aosta	AO	103	\N	\N
177	Bergamo	BG	103	\N	\N
178	Brescia	BS	103	\N	\N
179	Como	CO	103	\N	\N
180	Cremona	CR	103	\N	\N
181	Lecco	LC	103	\N	\N
182	Lodi	LO	103	\N	\N
183	Monza e Brianza	MB	103	\N	\N
184	Milano	MI	103	\N	\N
185	Mantova	MN	103	\N	\N
186	Pavia	PV	103	\N	\N
187	Sondrio	SO	103	\N	\N
188	Varese	VA	103	\N	\N
189	Bolzano	BZ	103	\N	\N
190	Trento	TN	103	\N	\N
191	Belluno	BL	103	\N	\N
192	Padova	PD	103	\N	\N
193	Rovigo	RO	103	\N	\N
194	Treviso	TV	103	\N	\N
195	Venezia	VE	103	\N	\N
196	Vicenza	VI	103	\N	\N
197	Verona	VR	103	\N	\N
198	Gorizia	GO	103	\N	\N
199	Pordenone	PN	103	\N	\N
200	Trieste	TS	103	\N	\N
201	Udine	UD	103	\N	\N
202	Genova	GE	103	\N	\N
203	Imperia	IM	103	\N	\N
204	La Spezia	SP	103	\N	\N
205	Savona	SV	103	\N	\N
206	Bologna	BO	103	\N	\N
207	Forlì-Cesena	FC	103	\N	\N
208	Ferrara	FE	103	\N	\N
209	Modena	MO	103	\N	\N
210	Piacenza	PC	103	\N	\N
211	Parma	PR	103	\N	\N
212	Ravenna	RA	103	\N	\N
213	Reggio Emilia	RE	103	\N	\N
214	Rimini	RN	103	\N	\N
215	Arezzo	AR	103	\N	\N
216	Firenze	FI	103	\N	\N
217	Grosseto	GR	103	\N	\N
218	Livorno	LI	103	\N	\N
219	Lucca	LU	103	\N	\N
220	Massa-Carrara	MS	103	\N	\N
221	Pisa	PI	103	\N	\N
222	Prato	PO	103	\N	\N
223	Pistoia	PT	103	\N	\N
224	Siena	SI	103	\N	\N
225	Perugia	PG	103	\N	\N
226	Terni	TR	103	\N	\N
227	Ancona	AN	103	\N	\N
228	Ascoli Piceno	AP	103	\N	\N
229	Fermo	FM	103	\N	\N
230	Macerata	MC	103	\N	\N
231	Pesaro e Urbino	PU	103	\N	\N
232	Frosinone	FR	103	\N	\N
233	Latina	LT	103	\N	\N
234	Rieti	RI	103	\N	\N
235	Roma	RM	103	\N	\N
236	Viterbo	VT	103	\N	\N
237	L'Aquila	AQ	103	\N	\N
238	Chieti	CH	103	\N	\N
239	Pescara	PE	103	\N	\N
240	Teramo	TE	103	\N	\N
241	Campobasso	CB	103	\N	\N
242	Isernia	IS	103	\N	\N
243	Avellino	AV	103	\N	\N
244	Benevento	BN	103	\N	\N
245	Caserta	CE	103	\N	\N
246	Napoli	NA	103	\N	\N
247	Salerno	SA	103	\N	\N
248	Bari	BA	103	\N	\N
249	Brindisi	BR	103	\N	\N
250	Barletta-Andria-Trani	BT	103	\N	\N
251	Foggia	FG	103	\N	\N
252	Lecce	LE	103	\N	\N
253	Taranto	TA	103	\N	\N
254	Matera	MT	103	\N	\N
255	Potenza	PZ	103	\N	\N
256	Cosenza	CS	103	\N	\N
257	Catanzaro	CZ	103	\N	\N
258	Crotone	KR	103	\N	\N
259	Reggio Calabria	RC	103	\N	\N
260	Vibo Valentia	VV	103	\N	\N
261	Agrigento	AG	103	\N	\N
262	Caltanissetta	CL	103	\N	\N
263	Catania	CT	103	\N	\N
264	Enna	EN	103	\N	\N
265	Messina	ME	103	\N	\N
266	Palermo	PA	103	\N	\N
267	Ragusa	RG	103	\N	\N
268	Siracusa	SR	103	\N	\N
269	Trapani	TP	103	\N	\N
270	Cagliari	CA	103	\N	\N
271	Carbonia-Iglesias	CI	103	\N	\N
272	Nuoro	NU	103	\N	\N
273	Ogliastra	OG	103	\N	\N
274	Oristano	OR	103	\N	\N
275	Olbia-Tempio	OT	103	\N	\N
276	Sassari	SS	103	\N	\N
277	Medio Campidano	VS	103	\N	\N
278	Aguascalientes	AGU	150	2022-07-12 18:10:05.775277	2022-07-12 18:10:05.775277
279	Baja California	BCN	150	2022-07-12 18:10:05.793828	2022-07-12 18:10:05.793828
280	Baja California Sur	BCS	150	2022-07-12 18:10:05.810978	2022-07-12 18:10:05.810978
281	Campeche	CAM	150	2022-07-12 18:10:05.827399	2022-07-12 18:10:05.827399
282	Chihuahua	CHH	150	2022-07-12 18:10:05.841179	2022-07-12 18:10:05.841179
283	Chiapas	CHP	150	2022-07-12 18:10:05.85536	2022-07-12 18:10:05.85536
284	Ciudad de México	CMX	150	2022-07-12 18:10:05.87104	2022-07-12 18:10:05.87104
285	Coahuila de Zaragoza	COA	150	2022-07-12 18:10:05.885181	2022-07-12 18:10:05.885181
286	Colima	COL	150	2022-07-12 18:10:05.898432	2022-07-12 18:10:05.898432
287	Durango	DUR	150	2022-07-12 18:10:05.919403	2022-07-12 18:10:05.919403
288	Guerrero	GRO	150	2022-07-12 18:10:05.990347	2022-07-12 18:10:05.990347
289	Guanajuato	GUA	150	2022-07-12 18:10:06.064438	2022-07-12 18:10:06.064438
290	Hidalgo	HID	150	2022-07-12 18:10:06.081417	2022-07-12 18:10:06.081417
291	Jalisco	JAL	150	2022-07-12 18:10:06.095447	2022-07-12 18:10:06.095447
292	México	MEX	150	2022-07-12 18:10:06.108846	2022-07-12 18:10:06.108846
293	Michoacán de Ocampo	MIC	150	2022-07-12 18:10:06.122676	2022-07-12 18:10:06.122676
294	Morelos	MOR	150	2022-07-12 18:10:06.136426	2022-07-12 18:10:06.136426
295	Nayarit	NAY	150	2022-07-12 18:10:06.150191	2022-07-12 18:10:06.150191
296	Nuevo León	NLE	150	2022-07-12 18:10:06.163944	2022-07-12 18:10:06.163944
297	Oaxaca	OAX	150	2022-07-12 18:10:06.177165	2022-07-12 18:10:06.177165
298	Puebla	PUE	150	2022-07-12 18:10:06.190432	2022-07-12 18:10:06.190432
299	Querétaro	QUE	150	2022-07-12 18:10:06.205061	2022-07-12 18:10:06.205061
300	Quintana Roo	ROO	150	2022-07-12 18:10:06.218516	2022-07-12 18:10:06.218516
301	Sinaloa	SIN	150	2022-07-12 18:10:06.232398	2022-07-12 18:10:06.232398
302	San Luis Potosí	SLP	150	2022-07-12 18:10:06.246599	2022-07-12 18:10:06.246599
303	Sonora	SON	150	2022-07-12 18:10:06.261213	2022-07-12 18:10:06.261213
304	Tabasco	TAB	150	2022-07-12 18:10:06.275176	2022-07-12 18:10:06.275176
305	Tamaulipas	TAM	150	2022-07-12 18:10:06.28863	2022-07-12 18:10:06.28863
306	Tlaxcala	TLA	150	2022-07-12 18:10:06.303553	2022-07-12 18:10:06.303553
307	Veracruz de Ignacio de la Llave	VER	150	2022-07-12 18:10:06.318206	2022-07-12 18:10:06.318206
308	Yucatán	YUC	150	2022-07-12 18:10:06.333143	2022-07-12 18:10:06.333143
309	Zacatecas	ZAC	150	2022-07-12 18:10:06.34679	2022-07-12 18:10:06.34679
310	Johor	01	151	2022-07-12 18:10:06.367272	2022-07-12 18:10:06.367272
311	Kedah	02	151	2022-07-12 18:10:06.380866	2022-07-12 18:10:06.380866
312	Kelantan	03	151	2022-07-12 18:10:06.39535	2022-07-12 18:10:06.39535
313	Melaka	04	151	2022-07-12 18:10:06.408702	2022-07-12 18:10:06.408702
314	Negeri Sembilan	05	151	2022-07-12 18:10:06.422618	2022-07-12 18:10:06.422618
315	Pahang	06	151	2022-07-12 18:10:06.436106	2022-07-12 18:10:06.436106
316	Pulau Pinang	07	151	2022-07-12 18:10:06.449697	2022-07-12 18:10:06.449697
317	Perak	08	151	2022-07-12 18:10:06.46611	2022-07-12 18:10:06.46611
318	Perlis	09	151	2022-07-12 18:10:06.481639	2022-07-12 18:10:06.481639
319	Selangor	10	151	2022-07-12 18:10:06.495321	2022-07-12 18:10:06.495321
320	Terengganu	11	151	2022-07-12 18:10:06.509103	2022-07-12 18:10:06.509103
321	Sabah	12	151	2022-07-12 18:10:06.52285	2022-07-12 18:10:06.52285
322	Sarawak	13	151	2022-07-12 18:10:06.536318	2022-07-12 18:10:06.536318
323	Wilayah Persekutuan Kuala Lumpur	14	151	2022-07-12 18:10:06.551022	2022-07-12 18:10:06.551022
324	Wilayah Persekutuan Labuan	15	151	2022-07-12 18:10:06.569528	2022-07-12 18:10:06.569528
325	Wilayah Persekutuan Putrajaya	16	151	2022-07-12 18:10:06.583933	2022-07-12 18:10:06.583933
326	Chatham Islands Territory	CIT	164	2022-07-12 18:10:06.604669	2022-07-12 18:10:06.604669
327	Auckland	AUK	164	2022-07-12 18:10:06.619074	2022-07-12 18:10:06.619074
328	Bay of Plenty	BOP	164	2022-07-12 18:10:06.633085	2022-07-12 18:10:06.633085
329	Canterbury	CAN	164	2022-07-12 18:10:06.646906	2022-07-12 18:10:06.646906
330	Gisborne	GIS	164	2022-07-12 18:10:06.660677	2022-07-12 18:10:06.660677
331	Hawke's Bay	HKB	164	2022-07-12 18:10:06.674674	2022-07-12 18:10:06.674674
332	Manawatu-Wanganui	MWT	164	2022-07-12 18:10:06.6888	2022-07-12 18:10:06.6888
333	Marlborough	MBH	164	2022-07-12 18:10:06.702509	2022-07-12 18:10:06.702509
334	Nelson	NSN	164	2022-07-12 18:10:06.716712	2022-07-12 18:10:06.716712
335	Northland	NTL	164	2022-07-12 18:10:06.7306	2022-07-12 18:10:06.7306
336	Otago	OTA	164	2022-07-12 18:10:06.744946	2022-07-12 18:10:06.744946
337	Southland	STL	164	2022-07-12 18:10:06.759457	2022-07-12 18:10:06.759457
338	Taranaki	TKI	164	2022-07-12 18:10:06.773515	2022-07-12 18:10:06.773515
339	Tasman	TAS	164	2022-07-12 18:10:06.787532	2022-07-12 18:10:06.787532
340	Wellington	WGN	164	2022-07-12 18:10:06.802228	2022-07-12 18:10:06.802228
341	Waikato	WKO	164	2022-07-12 18:10:06.818391	2022-07-12 18:10:06.818391
342	West Coast	WTC	164	2022-07-12 18:10:06.833076	2022-07-12 18:10:06.833076
343	Aveiro	01	177	2022-07-12 18:10:06.898811	2022-07-12 18:10:06.898811
344	Beja	02	177	2022-07-12 18:10:06.977882	2022-07-12 18:10:06.977882
345	Braga	03	177	2022-07-12 18:10:06.992981	2022-07-12 18:10:06.992981
346	Bragança	04	177	2022-07-12 18:10:07.00729	2022-07-12 18:10:07.00729
347	Castelo Branco	05	177	2022-07-12 18:10:07.021685	2022-07-12 18:10:07.021685
348	Coimbra	06	177	2022-07-12 18:10:07.036322	2022-07-12 18:10:07.036322
349	Évora	07	177	2022-07-12 18:10:07.050368	2022-07-12 18:10:07.050368
350	Faro	08	177	2022-07-12 18:10:07.064855	2022-07-12 18:10:07.064855
351	Guarda	09	177	2022-07-12 18:10:07.080037	2022-07-12 18:10:07.080037
352	Leiria	10	177	2022-07-12 18:10:07.094777	2022-07-12 18:10:07.094777
353	Lisboa	11	177	2022-07-12 18:10:07.109113	2022-07-12 18:10:07.109113
354	Portalegre	12	177	2022-07-12 18:10:07.126296	2022-07-12 18:10:07.126296
355	Porto	13	177	2022-07-12 18:10:07.142265	2022-07-12 18:10:07.142265
356	Santarém	14	177	2022-07-12 18:10:07.162551	2022-07-12 18:10:07.162551
357	Setúbal	15	177	2022-07-12 18:10:07.180853	2022-07-12 18:10:07.180853
358	Viana do Castelo	16	177	2022-07-12 18:10:07.196399	2022-07-12 18:10:07.196399
359	Vila Real	17	177	2022-07-12 18:10:07.210847	2022-07-12 18:10:07.210847
360	Viseu	18	177	2022-07-12 18:10:07.225331	2022-07-12 18:10:07.225331
361	Região Autónoma dos Açores	20	177	2022-07-12 18:10:07.23937	2022-07-12 18:10:07.23937
362	Região Autónoma da Madeira	30	177	2022-07-12 18:10:07.253599	2022-07-12 18:10:07.253599
363	Alba	AB	182	2022-07-12 18:10:07.277944	2022-07-12 18:10:07.277944
364	Argeș	AG	182	2022-07-12 18:10:07.292157	2022-07-12 18:10:07.292157
365	Arad	AR	182	2022-07-12 18:10:07.306174	2022-07-12 18:10:07.306174
366	București	B	182	2022-07-12 18:10:07.322188	2022-07-12 18:10:07.322188
367	Bacău	BC	182	2022-07-12 18:10:07.339028	2022-07-12 18:10:07.339028
368	Bihor	BH	182	2022-07-12 18:10:07.35405	2022-07-12 18:10:07.35405
369	Bistrița-Năsăud	BN	182	2022-07-12 18:10:07.369176	2022-07-12 18:10:07.369176
370	Brăila	BR	182	2022-07-12 18:10:07.383138	2022-07-12 18:10:07.383138
371	Botoșani	BT	182	2022-07-12 18:10:07.39775	2022-07-12 18:10:07.39775
372	Brașov	BV	182	2022-07-12 18:10:07.412716	2022-07-12 18:10:07.412716
373	Buzău	BZ	182	2022-07-12 18:10:07.427272	2022-07-12 18:10:07.427272
374	Cluj	CJ	182	2022-07-12 18:10:07.44375	2022-07-12 18:10:07.44375
375	Călărași	CL	182	2022-07-12 18:10:07.457599	2022-07-12 18:10:07.457599
376	Caraș-Severin	CS	182	2022-07-12 18:10:07.473173	2022-07-12 18:10:07.473173
377	Constanța	CT	182	2022-07-12 18:10:07.487762	2022-07-12 18:10:07.487762
378	Covasna	CV	182	2022-07-12 18:10:07.502629	2022-07-12 18:10:07.502629
379	Dâmbovița	DB	182	2022-07-12 18:10:07.517913	2022-07-12 18:10:07.517913
380	Dolj	DJ	182	2022-07-12 18:10:07.533878	2022-07-12 18:10:07.533878
381	Gorj	GJ	182	2022-07-12 18:10:07.549893	2022-07-12 18:10:07.549893
382	Galați	GL	182	2022-07-12 18:10:07.5654	2022-07-12 18:10:07.5654
383	Giurgiu	GR	182	2022-07-12 18:10:07.57956	2022-07-12 18:10:07.57956
384	Hunedoara	HD	182	2022-07-12 18:10:07.593777	2022-07-12 18:10:07.593777
385	Harghita	HR	182	2022-07-12 18:10:07.607812	2022-07-12 18:10:07.607812
386	Ilfov	IF	182	2022-07-12 18:10:07.622286	2022-07-12 18:10:07.622286
387	Ialomița	IL	182	2022-07-12 18:10:07.636895	2022-07-12 18:10:07.636895
388	Iași	IS	182	2022-07-12 18:10:07.656272	2022-07-12 18:10:07.656272
389	Mehedinți	MH	182	2022-07-12 18:10:07.67252	2022-07-12 18:10:07.67252
390	Maramureș	MM	182	2022-07-12 18:10:07.687468	2022-07-12 18:10:07.687468
391	Mureș	MS	182	2022-07-12 18:10:07.701554	2022-07-12 18:10:07.701554
392	Neamț	NT	182	2022-07-12 18:10:07.715889	2022-07-12 18:10:07.715889
393	Olt	OT	182	2022-07-12 18:10:07.754266	2022-07-12 18:10:07.754266
394	Prahova	PH	182	2022-07-12 18:10:07.776318	2022-07-12 18:10:07.776318
395	Sibiu	SB	182	2022-07-12 18:10:07.791669	2022-07-12 18:10:07.791669
396	Sălaj	SJ	182	2022-07-12 18:10:07.807378	2022-07-12 18:10:07.807378
397	Satu Mare	SM	182	2022-07-12 18:10:07.82202	2022-07-12 18:10:07.82202
398	Suceava	SV	182	2022-07-12 18:10:07.836996	2022-07-12 18:10:07.836996
399	Tulcea	TL	182	2022-07-12 18:10:07.851595	2022-07-12 18:10:07.851595
400	Timiș	TM	182	2022-07-12 18:10:07.86724	2022-07-12 18:10:07.86724
401	Teleorman	TR	182	2022-07-12 18:10:07.881656	2022-07-12 18:10:07.881656
402	Vâlcea	VL	182	2022-07-12 18:10:07.89627	2022-07-12 18:10:07.89627
403	Vrancea	VN	182	2022-07-12 18:10:07.909675	2022-07-12 18:10:07.909675
404	Vaslui	VS	182	2022-07-12 18:10:07.924387	2022-07-12 18:10:07.924387
405	Krung Thep Maha Nakhon Bangkok	10	210	2022-07-12 18:10:07.947162	2022-07-12 18:10:07.947162
406	Samut Prakan	11	210	2022-07-12 18:10:07.962069	2022-07-12 18:10:07.962069
407	Nonthaburi	12	210	2022-07-12 18:10:07.977378	2022-07-12 18:10:07.977378
408	Pathum Thani	13	210	2022-07-12 18:10:07.992449	2022-07-12 18:10:07.992449
409	Phra Nakhon Si Ayutthaya	14	210	2022-07-12 18:10:08.006902	2022-07-12 18:10:08.006902
410	Ang Thong	15	210	2022-07-12 18:10:08.021257	2022-07-12 18:10:08.021257
411	Lop Buri	16	210	2022-07-12 18:10:08.035913	2022-07-12 18:10:08.035913
412	Sing Buri	17	210	2022-07-12 18:10:08.051449	2022-07-12 18:10:08.051449
413	Chai Nat	18	210	2022-07-12 18:10:08.06635	2022-07-12 18:10:08.06635
414	Saraburi	19	210	2022-07-12 18:10:08.080565	2022-07-12 18:10:08.080565
415	Chon Buri	20	210	2022-07-12 18:10:08.094596	2022-07-12 18:10:08.094596
416	Rayong	21	210	2022-07-12 18:10:08.109141	2022-07-12 18:10:08.109141
417	Chanthaburi	22	210	2022-07-12 18:10:08.12394	2022-07-12 18:10:08.12394
418	Trat	23	210	2022-07-12 18:10:08.139066	2022-07-12 18:10:08.139066
419	Chachoengsao	24	210	2022-07-12 18:10:08.154058	2022-07-12 18:10:08.154058
420	Prachin Buri	25	210	2022-07-12 18:10:08.172927	2022-07-12 18:10:08.172927
421	Nakhon Nayok	26	210	2022-07-12 18:10:08.188729	2022-07-12 18:10:08.188729
422	Sa Kaeo	27	210	2022-07-12 18:10:08.203404	2022-07-12 18:10:08.203404
423	Nakhon Ratchasima	30	210	2022-07-12 18:10:08.217868	2022-07-12 18:10:08.217868
424	Buri Ram	31	210	2022-07-12 18:10:08.232519	2022-07-12 18:10:08.232519
425	Surin	32	210	2022-07-12 18:10:08.247549	2022-07-12 18:10:08.247549
426	Si Sa Ket	33	210	2022-07-12 18:10:08.261721	2022-07-12 18:10:08.261721
427	Ubon Ratchathani	34	210	2022-07-12 18:10:08.276608	2022-07-12 18:10:08.276608
428	Yasothon	35	210	2022-07-12 18:10:08.291538	2022-07-12 18:10:08.291538
429	Chaiyaphum	36	210	2022-07-12 18:10:08.306034	2022-07-12 18:10:08.306034
430	Amnat Charoen	37	210	2022-07-12 18:10:08.320345	2022-07-12 18:10:08.320345
431	Nong Bua Lam Phu	39	210	2022-07-12 18:10:08.33657	2022-07-12 18:10:08.33657
432	Khon Kaen	40	210	2022-07-12 18:10:08.351916	2022-07-12 18:10:08.351916
433	Udon Thani	41	210	2022-07-12 18:10:08.367785	2022-07-12 18:10:08.367785
434	Loei	42	210	2022-07-12 18:10:08.382571	2022-07-12 18:10:08.382571
435	Nong Khai	43	210	2022-07-12 18:10:08.397089	2022-07-12 18:10:08.397089
436	Maha Sarakham	44	210	2022-07-12 18:10:08.410631	2022-07-12 18:10:08.410631
437	Roi Et	45	210	2022-07-12 18:10:08.424148	2022-07-12 18:10:08.424148
438	Kalasin	46	210	2022-07-12 18:10:08.438864	2022-07-12 18:10:08.438864
439	Sakon Nakhon	47	210	2022-07-12 18:10:08.453805	2022-07-12 18:10:08.453805
440	Nakhon Phanom	48	210	2022-07-12 18:10:08.468596	2022-07-12 18:10:08.468596
441	Mukdahan	49	210	2022-07-12 18:10:08.484423	2022-07-12 18:10:08.484423
442	Chiang Mai	50	210	2022-07-12 18:10:08.498929	2022-07-12 18:10:08.498929
443	Lamphun	51	210	2022-07-12 18:10:08.513223	2022-07-12 18:10:08.513223
444	Lampang	52	210	2022-07-12 18:10:08.527944	2022-07-12 18:10:08.527944
445	Uttaradit	53	210	2022-07-12 18:10:08.543373	2022-07-12 18:10:08.543373
446	Phrae	54	210	2022-07-12 18:10:08.558362	2022-07-12 18:10:08.558362
447	Nan	55	210	2022-07-12 18:10:08.573518	2022-07-12 18:10:08.573518
448	Phayao	56	210	2022-07-12 18:10:08.587945	2022-07-12 18:10:08.587945
449	Chiang Rai	57	210	2022-07-12 18:10:08.602146	2022-07-12 18:10:08.602146
450	Mae Hong Son	58	210	2022-07-12 18:10:08.616701	2022-07-12 18:10:08.616701
451	Nakhon Sawan	60	210	2022-07-12 18:10:08.630886	2022-07-12 18:10:08.630886
452	Uthai Thani	61	210	2022-07-12 18:10:08.645548	2022-07-12 18:10:08.645548
453	Kamphaeng Phet	62	210	2022-07-12 18:10:08.664898	2022-07-12 18:10:08.664898
454	Tak	63	210	2022-07-12 18:10:08.704983	2022-07-12 18:10:08.704983
455	Sukhothai	64	210	2022-07-12 18:10:08.72299	2022-07-12 18:10:08.72299
456	Phitsanulok	65	210	2022-07-12 18:10:08.738124	2022-07-12 18:10:08.738124
457	Phichit	66	210	2022-07-12 18:10:08.753163	2022-07-12 18:10:08.753163
458	Phetchabun	67	210	2022-07-12 18:10:08.793689	2022-07-12 18:10:08.793689
459	Ratchaburi	70	210	2022-07-12 18:10:08.811155	2022-07-12 18:10:08.811155
460	Kanchanaburi	71	210	2022-07-12 18:10:08.826186	2022-07-12 18:10:08.826186
461	Suphan Buri	72	210	2022-07-12 18:10:08.840721	2022-07-12 18:10:08.840721
462	Nakhon Pathom	73	210	2022-07-12 18:10:08.855385	2022-07-12 18:10:08.855385
463	Samut Sakhon	74	210	2022-07-12 18:10:08.870701	2022-07-12 18:10:08.870701
464	Samut Songkhram	75	210	2022-07-12 18:10:08.885202	2022-07-12 18:10:08.885202
465	Phetchaburi	76	210	2022-07-12 18:10:08.899504	2022-07-12 18:10:08.899504
466	Prachuap Khiri Khan	77	210	2022-07-12 18:10:08.914396	2022-07-12 18:10:08.914396
467	Nakhon Si Thammarat	80	210	2022-07-12 18:10:08.929413	2022-07-12 18:10:08.929413
468	Krabi	81	210	2022-07-12 18:10:08.943739	2022-07-12 18:10:08.943739
469	Phangnga	82	210	2022-07-12 18:10:08.957316	2022-07-12 18:10:08.957316
470	Phuket	83	210	2022-07-12 18:10:08.973162	2022-07-12 18:10:08.973162
471	Surat Thani	84	210	2022-07-12 18:10:08.988864	2022-07-12 18:10:08.988864
472	Ranong	85	210	2022-07-12 18:10:09.002909	2022-07-12 18:10:09.002909
473	Chumphon	86	210	2022-07-12 18:10:09.018925	2022-07-12 18:10:09.018925
474	Songkhla	90	210	2022-07-12 18:10:09.034273	2022-07-12 18:10:09.034273
475	Satun	91	210	2022-07-12 18:10:09.049538	2022-07-12 18:10:09.049538
476	Trang	92	210	2022-07-12 18:10:09.064582	2022-07-12 18:10:09.064582
477	Phatthalung	93	210	2022-07-12 18:10:09.079405	2022-07-12 18:10:09.079405
478	Pattani	94	210	2022-07-12 18:10:09.0939	2022-07-12 18:10:09.0939
479	Yala	95	210	2022-07-12 18:10:09.108865	2022-07-12 18:10:09.108865
480	Narathiwat	96	210	2022-07-12 18:10:09.123847	2022-07-12 18:10:09.123847
481	Phatthaya	S	210	2022-07-12 18:10:09.140443	2022-07-12 18:10:09.140443
482	Alaska	AK	224	2022-07-12 18:10:09.165609	2022-07-12 18:10:09.165609
483	Alabama	AL	224	2022-07-12 18:10:09.184919	2022-07-12 18:10:09.184919
484	Arkansas	AR	224	2022-07-12 18:10:09.200547	2022-07-12 18:10:09.200547
485	Arizona	AZ	224	2022-07-12 18:10:09.215196	2022-07-12 18:10:09.215196
486	California	CA	224	2022-07-12 18:10:09.229755	2022-07-12 18:10:09.229755
487	Colorado	CO	224	2022-07-12 18:10:09.244909	2022-07-12 18:10:09.244909
488	Connecticut	CT	224	2022-07-12 18:10:09.259566	2022-07-12 18:10:09.259566
489	District of Columbia	DC	224	2022-07-12 18:10:09.274316	2022-07-12 18:10:09.274316
490	Delaware	DE	224	2022-07-12 18:10:09.290813	2022-07-12 18:10:09.290813
491	Florida	FL	224	2022-07-12 18:10:09.305614	2022-07-12 18:10:09.305614
492	Georgia	GA	224	2022-07-12 18:10:09.319583	2022-07-12 18:10:09.319583
493	Hawaii	HI	224	2022-07-12 18:10:09.334949	2022-07-12 18:10:09.334949
494	Iowa	IA	224	2022-07-12 18:10:09.351446	2022-07-12 18:10:09.351446
495	Idaho	ID	224	2022-07-12 18:10:09.367303	2022-07-12 18:10:09.367303
496	Illinois	IL	224	2022-07-12 18:10:09.383765	2022-07-12 18:10:09.383765
497	Indiana	IN	224	2022-07-12 18:10:09.397745	2022-07-12 18:10:09.397745
498	Kansas	KS	224	2022-07-12 18:10:09.411381	2022-07-12 18:10:09.411381
499	Kentucky	KY	224	2022-07-12 18:10:09.42602	2022-07-12 18:10:09.42602
500	Louisiana	LA	224	2022-07-12 18:10:09.441	2022-07-12 18:10:09.441
501	Massachusetts	MA	224	2022-07-12 18:10:09.458652	2022-07-12 18:10:09.458652
502	Maryland	MD	224	2022-07-12 18:10:09.474617	2022-07-12 18:10:09.474617
503	Maine	ME	224	2022-07-12 18:10:09.489904	2022-07-12 18:10:09.489904
504	Michigan	MI	224	2022-07-12 18:10:09.505136	2022-07-12 18:10:09.505136
505	Minnesota	MN	224	2022-07-12 18:10:09.520337	2022-07-12 18:10:09.520337
506	Missouri	MO	224	2022-07-12 18:10:09.535348	2022-07-12 18:10:09.535348
507	Mississippi	MS	224	2022-07-12 18:10:09.550675	2022-07-12 18:10:09.550675
508	Montana	MT	224	2022-07-12 18:10:09.565884	2022-07-12 18:10:09.565884
509	North Carolina	NC	224	2022-07-12 18:10:09.580547	2022-07-12 18:10:09.580547
510	North Dakota	ND	224	2022-07-12 18:10:09.595176	2022-07-12 18:10:09.595176
511	Nebraska	NE	224	2022-07-12 18:10:09.609534	2022-07-12 18:10:09.609534
512	New Hampshire	NH	224	2022-07-12 18:10:09.624308	2022-07-12 18:10:09.624308
513	New Jersey	NJ	224	2022-07-12 18:10:09.639837	2022-07-12 18:10:09.639837
514	New Mexico	NM	224	2022-07-12 18:10:09.65476	2022-07-12 18:10:09.65476
515	Nevada	NV	224	2022-07-12 18:10:09.675048	2022-07-12 18:10:09.675048
516	New York	NY	224	2022-07-12 18:10:09.690932	2022-07-12 18:10:09.690932
517	Ohio	OH	224	2022-07-12 18:10:09.706785	2022-07-12 18:10:09.706785
518	Oklahoma	OK	224	2022-07-12 18:10:09.721983	2022-07-12 18:10:09.721983
519	Oregon	OR	224	2022-07-12 18:10:09.737499	2022-07-12 18:10:09.737499
520	Pennsylvania	PA	224	2022-07-12 18:10:09.752398	2022-07-12 18:10:09.752398
521	Rhode Island	RI	224	2022-07-12 18:10:09.76725	2022-07-12 18:10:09.76725
522	South Carolina	SC	224	2022-07-12 18:10:09.782617	2022-07-12 18:10:09.782617
523	South Dakota	SD	224	2022-07-12 18:10:09.799005	2022-07-12 18:10:09.799005
524	Tennessee	TN	224	2022-07-12 18:10:09.814399	2022-07-12 18:10:09.814399
525	Texas	TX	224	2022-07-12 18:10:09.829366	2022-07-12 18:10:09.829366
526	Utah	UT	224	2022-07-12 18:10:09.84456	2022-07-12 18:10:09.84456
527	Virginia	VA	224	2022-07-12 18:10:09.859161	2022-07-12 18:10:09.859161
528	Vermont	VT	224	2022-07-12 18:10:09.874098	2022-07-12 18:10:09.874098
529	Washington	WA	224	2022-07-12 18:10:09.889942	2022-07-12 18:10:09.889942
530	Wisconsin	WI	224	2022-07-12 18:10:09.904896	2022-07-12 18:10:09.904896
531	West Virginia	WV	224	2022-07-12 18:10:09.919346	2022-07-12 18:10:09.919346
532	Wyoming	WY	224	2022-07-12 18:10:09.934197	2022-07-12 18:10:09.934197
533	Armed Forces Americas (except Canada)	AA	224	2022-07-12 18:10:09.949376	2022-07-12 18:10:09.949376
534	Armed Forces Africa, Canada, Europe, Middle East	AE	224	2022-07-12 18:10:09.969382	2022-07-12 18:10:09.969382
535	Armed Forces Pacific	AP	224	2022-07-12 18:10:09.986894	2022-07-12 18:10:09.986894
536	Eastern Cape	EC	238	2022-07-12 18:10:10.012803	2022-07-12 18:10:10.012803
537	Free State	FS	238	2022-07-12 18:10:10.028703	2022-07-12 18:10:10.028703
538	Gauteng	GT	238	2022-07-12 18:10:10.044343	2022-07-12 18:10:10.044343
539	Limpopo	LP	238	2022-07-12 18:10:10.059304	2022-07-12 18:10:10.059304
540	Mpumalanga	MP	238	2022-07-12 18:10:10.074378	2022-07-12 18:10:10.074378
541	Northern Cape	NC	238	2022-07-12 18:10:10.088888	2022-07-12 18:10:10.088888
542	Kwazulu-Natal	NL	238	2022-07-12 18:10:10.103215	2022-07-12 18:10:10.103215
543	North-West (South Africa)	NW	238	2022-07-12 18:10:10.117966	2022-07-12 18:10:10.117966
544	Western Cape	WC	238	2022-07-12 18:10:10.139932	2022-07-12 18:10:10.139932
545	'Ajmān	AJ	2	2022-07-12 18:10:10.159187	2022-07-12 18:10:10.159187
546	Abū Ȥaby [Abu Dhabi]	AZ	2	2022-07-12 18:10:10.175334	2022-07-12 18:10:10.175334
547	Dubayy	DU	2	2022-07-12 18:10:10.190722	2022-07-12 18:10:10.190722
548	Al Fujayrah	FU	2	2022-07-12 18:10:10.205592	2022-07-12 18:10:10.205592
549	Ra’s al Khaymah	RK	2	2022-07-12 18:10:10.219706	2022-07-12 18:10:10.219706
550	Ash Shāriqah	SH	2	2022-07-12 18:10:10.234974	2022-07-12 18:10:10.234974
551	Umm al Qaywayn	UQ	2	2022-07-12 18:10:10.249657	2022-07-12 18:10:10.249657
552	Galway	G	96	\N	\N
553	Leitrim	LM	96	\N	\N
554	Mayo	MO	96	\N	\N
555	Roscommon	RN	96	\N	\N
556	Sligo	SO	96	\N	\N
557	Carlow	CW	96	\N	\N
558	Dublin	D	96	\N	\N
559	Kildare	KE	96	\N	\N
560	Kilkenny	KK	96	\N	\N
561	Longford	LD	96	\N	\N
562	Louth	LH	96	\N	\N
563	Laois	LS	96	\N	\N
564	Meath	MH	96	\N	\N
565	Offaly	OY	96	\N	\N
566	Westmeath	WH	96	\N	\N
567	Wicklow	WW	96	\N	\N
568	Wexford	WX	96	\N	\N
569	Clare	CE	96	\N	\N
570	Cork	CO	96	\N	\N
571	Kerry	KY	96	\N	\N
572	Limerick	LK	96	\N	\N
573	Tipperary	TA	96	\N	\N
574	Waterford	WD	96	\N	\N
575	Cavan	CN	96	\N	\N
576	Donegal	DL	96	\N	\N
577	Monaghan	MN	96	\N	\N
\.


--
-- Data for Name: spree_stock_items; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.spree_stock_items (id, stock_location_id, variant_id, count_on_hand, created_at, updated_at, backorderable, deleted_at) FROM stdin;
3	1	3	0	2022-07-12 18:15:32.452792	2022-07-12 18:15:32.452805	f	\N
4	1	4	0	2022-07-12 18:15:32.452822	2022-07-12 18:15:32.452835	f	\N
5	1	5	0	2022-07-12 18:15:32.452852	2022-07-12 18:15:32.452958	f	\N
6	1	6	0	2022-07-12 18:15:32.452989	2022-07-12 18:15:32.452999	f	\N
7	1	7	0	2022-07-12 18:15:32.453017	2022-07-12 18:15:32.453031	f	\N
8	1	8	0	2022-07-12 18:15:32.453049	2022-07-12 18:15:32.453062	f	\N
9	1	9	0	2022-07-12 18:15:32.453079	2022-07-12 18:15:32.453092	f	\N
10	1	10	0	2022-07-12 18:15:32.453109	2022-07-12 18:15:32.453122	f	\N
11	1	11	0	2022-07-12 18:15:32.453139	2022-07-12 18:15:32.453152	f	\N
12	1	12	0	2022-07-12 18:15:32.453169	2022-07-12 18:15:32.453182	f	\N
13	1	13	0	2022-07-12 18:15:32.453199	2022-07-12 18:15:32.453212	f	\N
14	1	14	0	2022-07-12 18:15:32.45323	2022-07-12 18:15:32.453243	f	\N
15	1	15	0	2022-07-12 18:15:32.45326	2022-07-12 18:15:32.453274	f	\N
16	1	16	0	2022-07-12 18:15:32.45329	2022-07-12 18:15:32.453304	f	\N
17	1	17	0	2022-07-12 18:15:32.453321	2022-07-12 18:15:32.453334	f	\N
18	1	18	0	2022-07-12 18:15:32.453351	2022-07-12 18:15:32.453364	f	\N
19	1	19	0	2022-07-12 18:15:32.453381	2022-07-12 18:15:32.453394	f	\N
20	1	20	0	2022-07-12 18:15:32.453412	2022-07-12 18:15:32.453425	f	\N
21	1	21	0	2022-07-12 18:15:32.453442	2022-07-12 18:15:32.453456	f	\N
22	1	22	0	2022-07-12 18:15:32.453472	2022-07-12 18:15:32.453486	f	\N
23	1	23	0	2022-07-12 18:15:32.453503	2022-07-12 18:15:32.453516	f	\N
24	1	24	0	2022-07-12 18:15:32.453533	2022-07-12 18:15:32.453547	f	\N
25	1	25	0	2022-07-12 18:15:32.453564	2022-07-12 18:15:32.453577	f	\N
26	1	26	0	2022-07-12 18:15:32.453595	2022-07-12 18:15:32.453607	f	\N
27	1	27	0	2022-07-12 18:15:32.453624	2022-07-12 18:15:32.453637	f	\N
28	1	28	0	2022-07-12 18:15:32.453654	2022-07-12 18:15:32.453668	f	\N
29	1	29	0	2022-07-12 18:15:32.453685	2022-07-12 18:15:32.453698	f	\N
30	1	30	0	2022-07-12 18:15:32.453714	2022-07-12 18:15:32.453727	f	\N
31	1	31	0	2022-07-12 18:15:32.453744	2022-07-12 18:15:32.453757	f	\N
32	1	32	0	2022-07-12 18:15:32.453775	2022-07-12 18:15:32.453787	f	\N
33	1	33	0	2022-07-12 18:15:32.453804	2022-07-12 18:15:32.453817	f	\N
34	1	34	0	2022-07-12 18:15:32.453834	2022-07-12 18:15:32.453847	f	\N
35	1	35	0	2022-07-12 18:15:32.453922	2022-07-12 18:15:32.453936	f	\N
36	1	36	0	2022-07-12 18:15:32.453953	2022-07-12 18:15:32.453966	f	\N
37	1	37	0	2022-07-12 18:15:32.453983	2022-07-12 18:15:32.453996	f	\N
38	1	38	0	2022-07-12 18:15:32.454013	2022-07-12 18:15:32.454026	f	\N
39	1	39	0	2022-07-12 18:15:32.454043	2022-07-12 18:15:32.454056	f	\N
40	1	40	0	2022-07-12 18:15:32.454073	2022-07-12 18:15:32.454086	f	\N
41	1	41	0	2022-07-12 18:15:32.454102	2022-07-12 18:15:32.454115	f	\N
42	1	42	0	2022-07-12 18:15:32.454132	2022-07-12 18:15:32.454145	f	\N
43	1	43	0	2022-07-12 18:15:32.454162	2022-07-12 18:15:32.454175	f	\N
44	1	44	0	2022-07-12 18:15:32.454192	2022-07-12 18:15:32.454205	f	\N
45	1	45	0	2022-07-12 18:15:32.454223	2022-07-12 18:15:32.454236	f	\N
46	1	46	0	2022-07-12 18:15:32.454253	2022-07-12 18:15:32.454266	f	\N
47	1	47	0	2022-07-12 18:15:32.454283	2022-07-12 18:15:32.454296	f	\N
48	1	48	0	2022-07-12 18:15:32.454313	2022-07-12 18:15:32.454327	f	\N
49	1	49	0	2022-07-12 18:15:32.454344	2022-07-12 18:15:32.454358	f	\N
50	1	50	0	2022-07-12 18:15:32.454375	2022-07-12 18:15:32.454388	f	\N
51	1	51	0	2022-07-12 18:15:32.454406	2022-07-12 18:15:32.454419	f	\N
52	1	52	0	2022-07-12 18:15:32.454436	2022-07-12 18:15:32.454449	f	\N
53	1	53	0	2022-07-12 18:15:32.454466	2022-07-12 18:15:32.454479	f	\N
54	1	54	0	2022-07-12 18:15:32.454497	2022-07-12 18:15:32.45451	f	\N
55	1	55	0	2022-07-12 18:15:32.454527	2022-07-12 18:15:32.45454	f	\N
56	1	56	0	2022-07-12 18:15:32.454558	2022-07-12 18:15:32.454571	f	\N
57	1	57	0	2022-07-12 18:15:32.454588	2022-07-12 18:15:32.454601	f	\N
58	1	58	0	2022-07-12 18:15:32.454618	2022-07-12 18:15:32.454631	f	\N
59	1	59	0	2022-07-12 18:15:32.454648	2022-07-12 18:15:32.454661	f	\N
60	1	60	0	2022-07-12 18:15:32.454677	2022-07-12 18:15:32.45469	f	\N
61	1	61	0	2022-07-12 18:15:32.454707	2022-07-12 18:15:32.45472	f	\N
62	1	62	0	2022-07-12 18:15:32.454738	2022-07-12 18:15:32.454751	f	\N
63	1	63	0	2022-07-12 18:15:32.454768	2022-07-12 18:15:32.454781	f	\N
64	1	64	0	2022-07-12 18:15:32.454798	2022-07-12 18:15:32.454811	f	\N
65	1	65	0	2022-07-12 18:15:32.454828	2022-07-12 18:15:32.454903	f	\N
66	1	66	0	2022-07-12 18:15:32.454921	2022-07-12 18:15:32.454934	f	\N
67	1	67	0	2022-07-12 18:15:32.454951	2022-07-12 18:15:32.454965	f	\N
68	1	68	0	2022-07-12 18:15:32.454982	2022-07-12 18:15:32.454995	f	\N
69	1	69	0	2022-07-12 18:15:32.455012	2022-07-12 18:15:32.455025	f	\N
70	1	70	0	2022-07-12 18:15:32.455042	2022-07-12 18:15:32.455055	f	\N
71	1	71	0	2022-07-12 18:15:32.455073	2022-07-12 18:15:32.455086	f	\N
72	1	72	0	2022-07-12 18:15:32.455103	2022-07-12 18:15:32.455116	f	\N
73	1	73	0	2022-07-12 18:15:32.455133	2022-07-12 18:15:32.455146	f	\N
74	1	74	0	2022-07-12 18:15:32.455164	2022-07-12 18:15:32.455176	f	\N
75	1	75	0	2022-07-12 18:15:32.455194	2022-07-12 18:15:32.455207	f	\N
76	1	76	0	2022-07-12 18:15:32.455224	2022-07-12 18:15:32.455237	f	\N
77	1	77	0	2022-07-12 18:15:32.455255	2022-07-12 18:15:32.455268	f	\N
78	1	78	0	2022-07-12 18:15:32.455286	2022-07-12 18:15:32.455299	f	\N
79	1	79	0	2022-07-12 18:15:32.455316	2022-07-12 18:15:32.455329	f	\N
80	1	80	0	2022-07-12 18:15:32.455346	2022-07-12 18:15:32.455359	f	\N
81	1	81	0	2022-07-12 18:15:32.455376	2022-07-12 18:15:32.455389	f	\N
82	1	82	0	2022-07-12 18:15:32.455406	2022-07-12 18:15:32.455419	f	\N
83	1	83	0	2022-07-12 18:15:32.455436	2022-07-12 18:15:32.455449	f	\N
84	1	84	0	2022-07-12 18:15:32.455466	2022-07-12 18:15:32.455479	f	\N
85	1	85	0	2022-07-12 18:15:32.455496	2022-07-12 18:15:32.455509	f	\N
86	1	86	0	2022-07-12 18:15:32.455526	2022-07-12 18:15:32.455934	f	\N
87	1	87	0	2022-07-12 18:15:32.455956	2022-07-12 18:15:32.455969	f	\N
88	1	88	0	2022-07-12 18:15:32.455986	2022-07-12 18:15:32.455998	f	\N
89	1	89	0	2022-07-12 18:15:32.456015	2022-07-12 18:15:32.456028	f	\N
90	1	90	0	2022-07-12 18:15:32.456044	2022-07-12 18:15:32.456057	f	\N
91	1	91	0	2022-07-12 18:15:32.456074	2022-07-12 18:15:32.456087	f	\N
92	1	92	0	2022-07-12 18:15:32.456103	2022-07-12 18:15:32.456116	f	\N
93	1	93	0	2022-07-12 18:15:32.456133	2022-07-12 18:15:32.456146	f	\N
94	1	94	0	2022-07-12 18:15:32.456162	2022-07-12 18:15:32.456175	f	\N
95	1	95	0	2022-07-12 18:15:32.456192	2022-07-12 18:15:32.456205	f	\N
96	1	96	0	2022-07-12 18:15:32.456221	2022-07-12 18:15:32.456234	f	\N
97	1	97	0	2022-07-12 18:15:32.45625	2022-07-12 18:15:32.456263	f	\N
2	1	2	1	2022-07-12 18:15:32.452762	2022-07-12 18:15:32.670691	f	\N
98	1	98	0	2022-07-12 18:15:32.45628	2022-07-12 18:15:32.456293	f	\N
99	1	99	0	2022-07-12 18:15:32.456309	2022-07-12 18:15:32.456322	f	\N
100	1	100	0	2022-07-12 18:15:32.456338	2022-07-12 18:15:32.456351	f	\N
101	1	101	0	2022-07-12 18:15:32.456368	2022-07-12 18:15:32.45638	f	\N
102	1	102	0	2022-07-12 18:15:32.456397	2022-07-12 18:15:32.456409	f	\N
103	1	103	0	2022-07-12 18:15:32.456426	2022-07-12 18:15:32.456439	f	\N
104	1	104	0	2022-07-12 18:15:32.456455	2022-07-12 18:15:32.456468	f	\N
105	1	105	0	2022-07-12 18:15:32.456484	2022-07-12 18:15:32.456497	f	\N
106	1	106	0	2022-07-12 18:15:32.456514	2022-07-12 18:15:32.456527	f	\N
107	1	107	0	2022-07-12 18:15:32.456543	2022-07-12 18:15:32.456556	f	\N
108	1	108	0	2022-07-12 18:15:32.456573	2022-07-12 18:15:32.456586	f	\N
109	1	109	0	2022-07-12 18:15:32.456602	2022-07-12 18:15:32.456615	f	\N
110	1	110	0	2022-07-12 18:15:32.456632	2022-07-12 18:15:32.456644	f	\N
111	1	111	0	2022-07-12 18:15:32.456661	2022-07-12 18:15:32.456674	f	\N
112	1	112	0	2022-07-12 18:15:32.45669	2022-07-12 18:15:32.456703	f	\N
113	1	113	0	2022-07-12 18:15:32.456719	2022-07-12 18:15:32.456732	f	\N
114	1	114	0	2022-07-12 18:15:32.456748	2022-07-12 18:15:32.456761	f	\N
115	1	115	0	2022-07-12 18:15:32.456778	2022-07-12 18:15:32.456791	f	\N
116	1	116	0	2022-07-12 18:15:32.456807	2022-07-12 18:15:32.456871	f	\N
178	1	178	47	2022-07-12 18:15:32.458702	2022-07-12 18:15:33.011024	f	\N
117	1	117	42	2022-07-12 18:15:32.456889	2022-07-12 18:15:34.49221	f	\N
118	1	118	43	2022-07-12 18:15:32.45691	2022-07-12 18:15:34.629431	f	\N
119	1	119	42	2022-07-12 18:15:32.456928	2022-07-12 18:15:34.771755	f	\N
120	1	120	38	2022-07-12 18:15:32.456948	2022-07-12 18:15:34.919373	f	\N
122	1	122	21	2022-07-12 18:15:32.457004	2022-07-12 18:15:35.212575	f	\N
123	1	123	30	2022-07-12 18:15:32.457026	2022-07-12 18:15:35.355647	f	\N
124	1	124	20	2022-07-12 18:15:32.457056	2022-07-12 18:15:35.498614	f	\N
125	1	125	22	2022-07-12 18:15:32.457086	2022-07-12 18:15:35.645435	f	\N
126	1	126	32	2022-07-12 18:15:32.457115	2022-07-12 18:15:35.789989	f	\N
128	1	128	46	2022-07-12 18:15:32.457175	2022-07-12 18:15:35.937059	f	\N
129	1	129	47	2022-07-12 18:15:32.457204	2022-07-12 18:15:36.089716	f	\N
130	1	130	34	2022-07-12 18:15:32.457234	2022-07-12 18:15:36.265625	f	\N
131	1	131	41	2022-07-12 18:15:32.457264	2022-07-12 18:15:36.423706	f	\N
132	1	132	50	2022-07-12 18:15:32.457294	2022-07-12 18:15:36.5704	f	\N
133	1	133	35	2022-07-12 18:15:32.457324	2022-07-12 18:15:36.709948	f	\N
134	1	134	44	2022-07-12 18:15:32.457353	2022-07-12 18:15:36.846384	f	\N
135	1	135	47	2022-07-12 18:15:32.457382	2022-07-12 18:15:36.984927	f	\N
136	1	136	34	2022-07-12 18:15:32.457412	2022-07-12 18:15:37.123137	f	\N
137	1	137	40	2022-07-12 18:15:32.457442	2022-07-12 18:15:37.269536	f	\N
138	1	138	36	2022-07-12 18:15:32.457471	2022-07-12 18:15:37.40825	f	\N
139	1	139	22	2022-07-12 18:15:32.457501	2022-07-12 18:15:37.554128	f	\N
140	1	140	32	2022-07-12 18:15:32.457531	2022-07-12 18:15:37.690537	f	\N
141	1	141	24	2022-07-12 18:15:32.457561	2022-07-12 18:15:37.826523	f	\N
142	1	142	46	2022-07-12 18:15:32.457591	2022-07-12 18:15:37.970302	f	\N
144	1	144	20	2022-07-12 18:15:32.45765	2022-07-12 18:15:38.292258	f	\N
145	1	145	40	2022-07-12 18:15:32.457679	2022-07-12 18:15:38.463763	f	\N
146	1	146	21	2022-07-12 18:15:32.457709	2022-07-12 18:15:38.746283	f	\N
147	1	147	41	2022-07-12 18:15:32.457739	2022-07-12 18:15:38.979932	f	\N
148	1	148	23	2022-07-12 18:15:32.457768	2022-07-12 18:15:39.152255	f	\N
149	1	149	20	2022-07-12 18:15:32.457846	2022-07-12 18:15:39.309611	f	\N
150	1	150	45	2022-07-12 18:15:32.457877	2022-07-12 18:15:39.586821	f	\N
151	1	151	45	2022-07-12 18:15:32.457898	2022-07-12 18:15:39.761117	f	\N
152	1	152	32	2022-07-12 18:15:32.457923	2022-07-12 18:15:39.925089	f	\N
153	1	153	35	2022-07-12 18:15:32.457953	2022-07-12 18:15:40.08566	f	\N
154	1	154	38	2022-07-12 18:15:32.457983	2022-07-12 18:15:40.248434	f	\N
155	1	155	26	2022-07-12 18:15:32.458013	2022-07-12 18:15:40.421184	f	\N
156	1	156	42	2022-07-12 18:15:32.458044	2022-07-12 18:15:40.586046	f	\N
157	1	157	45	2022-07-12 18:15:32.458074	2022-07-12 18:15:40.757423	f	\N
158	1	158	24	2022-07-12 18:15:32.458103	2022-07-12 18:15:40.910725	f	\N
159	1	159	20	2022-07-12 18:15:32.458133	2022-07-12 18:15:41.058157	f	\N
160	1	160	28	2022-07-12 18:15:32.458162	2022-07-12 18:15:41.202544	f	\N
161	1	161	21	2022-07-12 18:15:32.458192	2022-07-12 18:15:41.360293	f	\N
162	1	162	23	2022-07-12 18:15:32.458222	2022-07-12 18:15:41.514218	f	\N
163	1	163	36	2022-07-12 18:15:32.458252	2022-07-12 18:15:41.693341	f	\N
165	1	165	26	2022-07-12 18:15:32.458312	2022-07-12 18:15:42.020555	f	\N
166	1	166	29	2022-07-12 18:15:32.458342	2022-07-12 18:15:42.206589	f	\N
167	1	167	43	2022-07-12 18:15:32.458372	2022-07-12 18:15:42.379203	f	\N
168	1	168	21	2022-07-12 18:15:32.458401	2022-07-12 18:15:42.527968	f	\N
169	1	169	40	2022-07-12 18:15:32.458431	2022-07-12 18:15:42.684725	f	\N
170	1	170	39	2022-07-12 18:15:32.458461	2022-07-12 18:15:42.849198	f	\N
171	1	171	40	2022-07-12 18:15:32.458492	2022-07-12 18:15:43.009678	f	\N
172	1	172	42	2022-07-12 18:15:32.458522	2022-07-12 18:15:43.212308	f	\N
173	1	173	30	2022-07-12 18:15:32.458552	2022-07-12 18:15:43.38453	f	\N
174	1	174	40	2022-07-12 18:15:32.458583	2022-07-12 18:15:43.641965	f	\N
175	1	175	38	2022-07-12 18:15:32.458612	2022-07-12 18:15:43.990396	f	\N
176	1	176	35	2022-07-12 18:15:32.458643	2022-07-12 18:15:44.197296	f	\N
177	1	177	39	2022-07-12 18:15:32.458672	2022-07-12 18:15:44.349567	f	\N
179	1	179	24	2022-07-12 18:15:32.458731	2022-07-12 18:15:44.494435	f	\N
180	1	180	45	2022-07-12 18:15:32.458761	2022-07-12 18:15:44.646215	f	\N
181	1	181	50	2022-07-12 18:15:32.45884	2022-07-12 18:15:44.809769	f	\N
182	1	182	47	2022-07-12 18:15:32.45887	2022-07-12 18:15:44.968278	f	\N
183	1	183	41	2022-07-12 18:15:32.4589	2022-07-12 18:15:45.127409	f	\N
184	1	184	39	2022-07-12 18:15:32.45893	2022-07-12 18:15:45.272341	f	\N
185	1	185	25	2022-07-12 18:15:32.45896	2022-07-12 18:15:45.427304	f	\N
187	1	187	27	2022-07-12 18:15:32.45902	2022-07-12 18:15:45.796471	f	\N
188	1	188	33	2022-07-12 18:15:32.45905	2022-07-12 18:15:45.991277	f	\N
189	1	189	27	2022-07-12 18:15:32.45908	2022-07-12 18:15:46.191938	f	\N
190	1	190	33	2022-07-12 18:15:32.45911	2022-07-12 18:15:46.369318	f	\N
191	1	191	39	2022-07-12 18:15:32.45914	2022-07-12 18:15:46.596468	f	\N
192	1	192	47	2022-07-12 18:15:32.45917	2022-07-12 18:15:46.813856	f	\N
193	1	193	28	2022-07-12 18:15:32.4592	2022-07-12 18:15:46.976301	f	\N
194	1	194	47	2022-07-12 18:15:32.459231	2022-07-12 18:15:47.181825	f	\N
1	1	1	1	2022-07-12 18:15:32.45271	2022-07-12 18:15:32.58779	f	\N
127	1	127	49	2022-07-12 18:15:32.457145	2022-07-12 18:15:32.853641	f	\N
228	1	228	29	2022-07-12 18:15:32.460325	2022-07-12 18:15:33.506546	f	\N
229	1	229	25	2022-07-12 18:15:32.460355	2022-07-12 18:15:33.671231	f	\N
230	1	230	30	2022-07-12 18:15:32.460385	2022-07-12 18:15:33.814698	f	\N
231	1	231	20	2022-07-12 18:15:32.460415	2022-07-12 18:15:33.997662	f	\N
121	1	121	32	2022-07-12 18:15:32.456975	2022-07-12 18:15:35.059716	f	\N
143	1	143	44	2022-07-12 18:15:32.45762	2022-07-12 18:15:38.123942	f	\N
164	1	164	34	2022-07-12 18:15:32.458282	2022-07-12 18:15:41.857292	f	\N
186	1	186	27	2022-07-12 18:15:32.45899	2022-07-12 18:15:45.582316	f	\N
195	1	195	42	2022-07-12 18:15:32.45926	2022-07-12 18:15:47.340103	f	\N
196	1	196	33	2022-07-12 18:15:32.45929	2022-07-12 18:15:47.49823	f	\N
197	1	197	23	2022-07-12 18:15:32.45932	2022-07-12 18:15:47.655012	f	\N
198	1	198	38	2022-07-12 18:15:32.45935	2022-07-12 18:15:47.807135	f	\N
199	1	199	36	2022-07-12 18:15:32.45938	2022-07-12 18:15:47.961238	f	\N
200	1	200	20	2022-07-12 18:15:32.45941	2022-07-12 18:15:48.120496	f	\N
201	1	201	43	2022-07-12 18:15:32.459439	2022-07-12 18:15:48.272194	f	\N
202	1	202	20	2022-07-12 18:15:32.45947	2022-07-12 18:15:48.426864	f	\N
203	1	203	29	2022-07-12 18:15:32.459499	2022-07-12 18:15:48.600706	f	\N
204	1	204	46	2022-07-12 18:15:32.459529	2022-07-12 18:15:48.751017	f	\N
205	1	205	47	2022-07-12 18:15:32.459558	2022-07-12 18:15:48.896769	f	\N
206	1	206	32	2022-07-12 18:15:32.459589	2022-07-12 18:15:49.059416	f	\N
207	1	207	41	2022-07-12 18:15:32.459618	2022-07-12 18:15:49.221355	f	\N
208	1	208	23	2022-07-12 18:15:32.459648	2022-07-12 18:15:49.373861	f	\N
209	1	209	50	2022-07-12 18:15:32.459678	2022-07-12 18:15:49.528491	f	\N
210	1	210	37	2022-07-12 18:15:32.459708	2022-07-12 18:15:49.680308	f	\N
211	1	211	47	2022-07-12 18:15:32.459738	2022-07-12 18:15:49.82892	f	\N
212	1	212	35	2022-07-12 18:15:32.459856	2022-07-12 18:15:49.983015	f	\N
213	1	213	46	2022-07-12 18:15:32.459882	2022-07-12 18:15:50.127905	f	\N
214	1	214	48	2022-07-12 18:15:32.459908	2022-07-12 18:15:50.297846	f	\N
215	1	215	26	2022-07-12 18:15:32.459938	2022-07-12 18:15:50.449805	f	\N
216	1	216	38	2022-07-12 18:15:32.459968	2022-07-12 18:15:50.601842	f	\N
217	1	217	21	2022-07-12 18:15:32.459998	2022-07-12 18:15:50.769904	f	\N
218	1	218	40	2022-07-12 18:15:32.460028	2022-07-12 18:15:50.924319	f	\N
219	1	219	21	2022-07-12 18:15:32.460058	2022-07-12 18:15:51.07615	f	\N
220	1	220	29	2022-07-12 18:15:32.460088	2022-07-12 18:15:51.220197	f	\N
221	1	221	20	2022-07-12 18:15:32.460117	2022-07-12 18:15:51.375491	f	\N
222	1	222	47	2022-07-12 18:15:32.460147	2022-07-12 18:15:51.532237	f	\N
223	1	223	43	2022-07-12 18:15:32.460177	2022-07-12 18:15:51.686628	f	\N
224	1	224	22	2022-07-12 18:15:32.460206	2022-07-12 18:15:51.837532	f	\N
225	1	225	29	2022-07-12 18:15:32.460236	2022-07-12 18:15:51.987345	f	\N
226	1	226	27	2022-07-12 18:15:32.460266	2022-07-12 18:15:52.133913	f	\N
227	1	227	29	2022-07-12 18:15:32.460295	2022-07-12 18:15:52.290001	f	\N
232	1	232	50	2022-07-12 18:15:32.460445	2022-07-12 18:15:52.444824	f	\N
\.


--
-- Data for Name: spree_stock_locations; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.spree_stock_locations (id, name, created_at, updated_at, "default", address1, address2, city, state_id, state_name, country_id, zipcode, phone, active, backorderable_default, propagate_all_variants, admin_name) FROM stdin;
1	default	2022-07-12 18:10:15.24519	2022-07-12 18:15:32.438735	t	Example Street	\N	City	483	\N	224	12345	\N	t	f	f	\N
\.


--
-- Data for Name: spree_stock_movements; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.spree_stock_movements (id, stock_item_id, quantity, action, created_at, updated_at, originator_type, originator_id) FROM stdin;
1	127	49	\N	2022-07-12 18:15:32.78468	2022-07-12 18:15:32.78468	\N	\N
2	178	47	\N	2022-07-12 18:15:32.961873	2022-07-12 18:15:32.961873	\N	\N
3	228	29	\N	2022-07-12 18:15:33.45479	2022-07-12 18:15:33.45479	\N	\N
4	229	25	\N	2022-07-12 18:15:33.623155	2022-07-12 18:15:33.623155	\N	\N
5	230	30	\N	2022-07-12 18:15:33.76863	2022-07-12 18:15:33.76863	\N	\N
6	231	20	\N	2022-07-12 18:15:33.943098	2022-07-12 18:15:33.943098	\N	\N
7	117	42	\N	2022-07-12 18:15:34.446092	2022-07-12 18:15:34.446092	\N	\N
8	118	43	\N	2022-07-12 18:15:34.584035	2022-07-12 18:15:34.584035	\N	\N
9	119	42	\N	2022-07-12 18:15:34.72435	2022-07-12 18:15:34.72435	\N	\N
10	120	38	\N	2022-07-12 18:15:34.872651	2022-07-12 18:15:34.872651	\N	\N
11	121	32	\N	2022-07-12 18:15:35.014509	2022-07-12 18:15:35.014509	\N	\N
12	122	21	\N	2022-07-12 18:15:35.162963	2022-07-12 18:15:35.162963	\N	\N
13	123	30	\N	2022-07-12 18:15:35.310181	2022-07-12 18:15:35.310181	\N	\N
14	124	20	\N	2022-07-12 18:15:35.452645	2022-07-12 18:15:35.452645	\N	\N
15	125	22	\N	2022-07-12 18:15:35.598628	2022-07-12 18:15:35.598628	\N	\N
16	126	32	\N	2022-07-12 18:15:35.744559	2022-07-12 18:15:35.744559	\N	\N
17	128	46	\N	2022-07-12 18:15:35.890488	2022-07-12 18:15:35.890488	\N	\N
18	129	47	\N	2022-07-12 18:15:36.04426	2022-07-12 18:15:36.04426	\N	\N
19	130	34	\N	2022-07-12 18:15:36.219543	2022-07-12 18:15:36.219543	\N	\N
20	131	41	\N	2022-07-12 18:15:36.377124	2022-07-12 18:15:36.377124	\N	\N
21	132	50	\N	2022-07-12 18:15:36.526468	2022-07-12 18:15:36.526468	\N	\N
22	133	35	\N	2022-07-12 18:15:36.666197	2022-07-12 18:15:36.666197	\N	\N
23	134	44	\N	2022-07-12 18:15:36.801753	2022-07-12 18:15:36.801753	\N	\N
24	135	47	\N	2022-07-12 18:15:36.941088	2022-07-12 18:15:36.941088	\N	\N
25	136	34	\N	2022-07-12 18:15:37.078876	2022-07-12 18:15:37.078876	\N	\N
26	137	40	\N	2022-07-12 18:15:37.223224	2022-07-12 18:15:37.223224	\N	\N
27	138	36	\N	2022-07-12 18:15:37.364593	2022-07-12 18:15:37.364593	\N	\N
28	139	22	\N	2022-07-12 18:15:37.507117	2022-07-12 18:15:37.507117	\N	\N
29	140	32	\N	2022-07-12 18:15:37.645676	2022-07-12 18:15:37.645676	\N	\N
30	141	24	\N	2022-07-12 18:15:37.782272	2022-07-12 18:15:37.782272	\N	\N
31	142	46	\N	2022-07-12 18:15:37.924352	2022-07-12 18:15:37.924352	\N	\N
32	143	44	\N	2022-07-12 18:15:38.07368	2022-07-12 18:15:38.07368	\N	\N
33	144	20	\N	2022-07-12 18:15:38.238498	2022-07-12 18:15:38.238498	\N	\N
34	145	40	\N	2022-07-12 18:15:38.409506	2022-07-12 18:15:38.409506	\N	\N
35	146	21	\N	2022-07-12 18:15:38.644275	2022-07-12 18:15:38.644275	\N	\N
36	147	41	\N	2022-07-12 18:15:38.926899	2022-07-12 18:15:38.926899	\N	\N
37	148	23	\N	2022-07-12 18:15:39.101712	2022-07-12 18:15:39.101712	\N	\N
38	149	20	\N	2022-07-12 18:15:39.25904	2022-07-12 18:15:39.25904	\N	\N
39	150	45	\N	2022-07-12 18:15:39.495104	2022-07-12 18:15:39.495104	\N	\N
40	151	45	\N	2022-07-12 18:15:39.711703	2022-07-12 18:15:39.711703	\N	\N
41	152	32	\N	2022-07-12 18:15:39.86765	2022-07-12 18:15:39.86765	\N	\N
42	153	35	\N	2022-07-12 18:15:40.034215	2022-07-12 18:15:40.034215	\N	\N
43	154	38	\N	2022-07-12 18:15:40.194405	2022-07-12 18:15:40.194405	\N	\N
44	155	26	\N	2022-07-12 18:15:40.36491	2022-07-12 18:15:40.36491	\N	\N
45	156	42	\N	2022-07-12 18:15:40.533343	2022-07-12 18:15:40.533343	\N	\N
46	157	45	\N	2022-07-12 18:15:40.705553	2022-07-12 18:15:40.705553	\N	\N
47	158	24	\N	2022-07-12 18:15:40.862601	2022-07-12 18:15:40.862601	\N	\N
48	159	20	\N	2022-07-12 18:15:41.009363	2022-07-12 18:15:41.009363	\N	\N
49	160	28	\N	2022-07-12 18:15:41.153885	2022-07-12 18:15:41.153885	\N	\N
50	161	21	\N	2022-07-12 18:15:41.310699	2022-07-12 18:15:41.310699	\N	\N
51	162	23	\N	2022-07-12 18:15:41.465721	2022-07-12 18:15:41.465721	\N	\N
52	163	36	\N	2022-07-12 18:15:41.645505	2022-07-12 18:15:41.645505	\N	\N
53	164	34	\N	2022-07-12 18:15:41.806174	2022-07-12 18:15:41.806174	\N	\N
54	165	26	\N	2022-07-12 18:15:41.963567	2022-07-12 18:15:41.963567	\N	\N
55	166	29	\N	2022-07-12 18:15:42.146353	2022-07-12 18:15:42.146353	\N	\N
56	167	43	\N	2022-07-12 18:15:42.324971	2022-07-12 18:15:42.324971	\N	\N
57	168	21	\N	2022-07-12 18:15:42.479828	2022-07-12 18:15:42.479828	\N	\N
58	169	40	\N	2022-07-12 18:15:42.634016	2022-07-12 18:15:42.634016	\N	\N
59	170	39	\N	2022-07-12 18:15:42.79729	2022-07-12 18:15:42.79729	\N	\N
60	171	40	\N	2022-07-12 18:15:42.954282	2022-07-12 18:15:42.954282	\N	\N
61	172	42	\N	2022-07-12 18:15:43.152692	2022-07-12 18:15:43.152692	\N	\N
62	173	30	\N	2022-07-12 18:15:43.329116	2022-07-12 18:15:43.329116	\N	\N
63	174	40	\N	2022-07-12 18:15:43.495986	2022-07-12 18:15:43.495986	\N	\N
64	175	38	\N	2022-07-12 18:15:43.90417	2022-07-12 18:15:43.90417	\N	\N
65	176	35	\N	2022-07-12 18:15:44.119478	2022-07-12 18:15:44.119478	\N	\N
66	177	39	\N	2022-07-12 18:15:44.302259	2022-07-12 18:15:44.302259	\N	\N
67	179	24	\N	2022-07-12 18:15:44.443082	2022-07-12 18:15:44.443082	\N	\N
68	180	45	\N	2022-07-12 18:15:44.600243	2022-07-12 18:15:44.600243	\N	\N
69	181	50	\N	2022-07-12 18:15:44.756806	2022-07-12 18:15:44.756806	\N	\N
70	182	47	\N	2022-07-12 18:15:44.92136	2022-07-12 18:15:44.92136	\N	\N
71	183	41	\N	2022-07-12 18:15:45.076232	2022-07-12 18:15:45.076232	\N	\N
72	184	39	\N	2022-07-12 18:15:45.224247	2022-07-12 18:15:45.224247	\N	\N
73	185	25	\N	2022-07-12 18:15:45.374344	2022-07-12 18:15:45.374344	\N	\N
74	186	27	\N	2022-07-12 18:15:45.53047	2022-07-12 18:15:45.53047	\N	\N
75	187	27	\N	2022-07-12 18:15:45.74501	2022-07-12 18:15:45.74501	\N	\N
76	188	33	\N	2022-07-12 18:15:45.939103	2022-07-12 18:15:45.939103	\N	\N
77	189	27	\N	2022-07-12 18:15:46.140331	2022-07-12 18:15:46.140331	\N	\N
78	190	33	\N	2022-07-12 18:15:46.312799	2022-07-12 18:15:46.312799	\N	\N
79	191	39	\N	2022-07-12 18:15:46.527592	2022-07-12 18:15:46.527592	\N	\N
80	192	47	\N	2022-07-12 18:15:46.757245	2022-07-12 18:15:46.757245	\N	\N
81	193	28	\N	2022-07-12 18:15:46.925407	2022-07-12 18:15:46.925407	\N	\N
82	194	47	\N	2022-07-12 18:15:47.130335	2022-07-12 18:15:47.130335	\N	\N
83	195	42	\N	2022-07-12 18:15:47.286958	2022-07-12 18:15:47.286958	\N	\N
84	196	33	\N	2022-07-12 18:15:47.448134	2022-07-12 18:15:47.448134	\N	\N
85	197	23	\N	2022-07-12 18:15:47.607419	2022-07-12 18:15:47.607419	\N	\N
86	198	38	\N	2022-07-12 18:15:47.759305	2022-07-12 18:15:47.759305	\N	\N
87	199	36	\N	2022-07-12 18:15:47.912039	2022-07-12 18:15:47.912039	\N	\N
88	200	20	\N	2022-07-12 18:15:48.072396	2022-07-12 18:15:48.072396	\N	\N
89	201	43	\N	2022-07-12 18:15:48.223719	2022-07-12 18:15:48.223719	\N	\N
90	202	20	\N	2022-07-12 18:15:48.37827	2022-07-12 18:15:48.37827	\N	\N
91	203	29	\N	2022-07-12 18:15:48.526301	2022-07-12 18:15:48.526301	\N	\N
92	204	46	\N	2022-07-12 18:15:48.704397	2022-07-12 18:15:48.704397	\N	\N
93	205	47	\N	2022-07-12 18:15:48.849804	2022-07-12 18:15:48.849804	\N	\N
94	206	32	\N	2022-07-12 18:15:49.007179	2022-07-12 18:15:49.007179	\N	\N
95	207	41	\N	2022-07-12 18:15:49.170408	2022-07-12 18:15:49.170408	\N	\N
96	208	23	\N	2022-07-12 18:15:49.325291	2022-07-12 18:15:49.325291	\N	\N
97	209	50	\N	2022-07-12 18:15:49.480825	2022-07-12 18:15:49.480825	\N	\N
98	210	37	\N	2022-07-12 18:15:49.63403	2022-07-12 18:15:49.63403	\N	\N
99	211	47	\N	2022-07-12 18:15:49.780696	2022-07-12 18:15:49.780696	\N	\N
100	212	35	\N	2022-07-12 18:15:49.935922	2022-07-12 18:15:49.935922	\N	\N
101	213	46	\N	2022-07-12 18:15:50.0808	2022-07-12 18:15:50.0808	\N	\N
102	214	48	\N	2022-07-12 18:15:50.246208	2022-07-12 18:15:50.246208	\N	\N
103	215	26	\N	2022-07-12 18:15:50.402103	2022-07-12 18:15:50.402103	\N	\N
104	216	38	\N	2022-07-12 18:15:50.550703	2022-07-12 18:15:50.550703	\N	\N
105	217	21	\N	2022-07-12 18:15:50.715301	2022-07-12 18:15:50.715301	\N	\N
106	218	40	\N	2022-07-12 18:15:50.874821	2022-07-12 18:15:50.874821	\N	\N
107	219	21	\N	2022-07-12 18:15:51.028671	2022-07-12 18:15:51.028671	\N	\N
108	220	29	\N	2022-07-12 18:15:51.172972	2022-07-12 18:15:51.172972	\N	\N
109	221	20	\N	2022-07-12 18:15:51.321074	2022-07-12 18:15:51.321074	\N	\N
110	222	47	\N	2022-07-12 18:15:51.478665	2022-07-12 18:15:51.478665	\N	\N
111	223	43	\N	2022-07-12 18:15:51.63819	2022-07-12 18:15:51.63819	\N	\N
112	224	22	\N	2022-07-12 18:15:51.789091	2022-07-12 18:15:51.789091	\N	\N
113	225	29	\N	2022-07-12 18:15:51.938729	2022-07-12 18:15:51.938729	\N	\N
114	226	27	\N	2022-07-12 18:15:52.086709	2022-07-12 18:15:52.086709	\N	\N
115	227	29	\N	2022-07-12 18:15:52.241894	2022-07-12 18:15:52.241894	\N	\N
116	232	50	\N	2022-07-12 18:15:52.39771	2022-07-12 18:15:52.39771	\N	\N
\.


--
-- Data for Name: spree_stock_transfers; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.spree_stock_transfers (id, type, reference, source_location_id, destination_location_id, created_at, updated_at, number, public_metadata, private_metadata) FROM stdin;
\.


--
-- Data for Name: spree_store_credit_categories; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.spree_store_credit_categories (id, name, created_at, updated_at) FROM stdin;
1	Default	2022-07-12 18:10:15.124218	2022-07-12 18:10:15.124218
2	Non-expiring	2022-07-12 18:10:15.132929	2022-07-12 18:10:15.132929
3	Expiring	2022-07-12 18:10:15.141368	2022-07-12 18:10:15.141368
\.


--
-- Data for Name: spree_store_credit_events; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.spree_store_credit_events (id, store_credit_id, action, amount, authorization_code, user_total_amount, originator_id, originator_type, deleted_at, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: spree_store_credit_types; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.spree_store_credit_types (id, name, priority, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: spree_store_credits; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.spree_store_credits (id, user_id, category_id, created_by_id, amount, amount_used, memo, deleted_at, currency, amount_authorized, originator_id, originator_type, type_id, created_at, updated_at, store_id, public_metadata, private_metadata) FROM stdin;
\.


--
-- Data for Name: spree_stores; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.spree_stores (id, name, url, meta_description, meta_keywords, seo_title, mail_from_address, default_currency, code, "default", created_at, updated_at, supported_currencies, facebook, twitter, instagram, default_locale, customer_support_email, default_country_id, description, address, contact_phone, new_order_notifications_email, checkout_zone_id, seo_robots, supported_locales, deleted_at, settings) FROM stdin;
1	Spree Demo Site	localhost:3000	This is the new Spree UX DEMO | OVERVIEW: http://bit.ly/new-spree-ux | DOCS: http://bit.ly/spree-ux-customization-docs | CONTACT: https://spreecommerce.org/contact/	\N	Spree Commerce Demo Shop	no-reply@example.com	USD	spree	t	2022-07-12 18:10:15.205657	2022-07-12 18:16:09.879988	CAD,USD	spreecommerce	spreecommerce	spreecommerce	en	support@example.com	224	\N	\N	\N	\N	3	\N	en,fr	\N	{"limit_digital_download_days": true, "limit_digital_download_count": true, "digital_asset_authorized_days": 7, "digital_asset_link_expire_time": 300, "digital_asset_authorized_clicks": 5}
2	EU Store	eu.lvh.me:3000	\N	\N	\N	eustore@example.com	EUR	eustore	f	2022-07-12 18:13:09.659503	2022-07-12 18:16:24.666541	EUR	\N	\N	\N	de	\N	54	\N	\N	\N	\N	1	\N	de,fr,es	\N	{"limit_digital_download_days": true, "limit_digital_download_count": true, "digital_asset_authorized_days": 7, "digital_asset_link_expire_time": 300, "digital_asset_authorized_clicks": 5}
3	UK Store	uk.lvh.me:3000	\N	\N	\N	ukstore@example.com	GBP	ukstore	f	2022-07-12 18:13:09.683842	2022-07-12 18:16:30.922302	GBP	\N	\N	\N	en	\N	73	\N	\N	\N	\N	2	\N	en	\N	{"limit_digital_download_days": true, "limit_digital_download_count": true, "digital_asset_authorized_days": 7, "digital_asset_link_expire_time": 300, "digital_asset_authorized_clicks": 5}
\.


--
-- Data for Name: spree_tax_categories; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.spree_tax_categories (id, name, description, is_default, deleted_at, created_at, updated_at, tax_code) FROM stdin;
1	Clothing	\N	f	\N	2022-07-12 18:13:10.454216	2022-07-12 18:13:10.454216	\N
\.


--
-- Data for Name: spree_tax_rates; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.spree_tax_rates (id, amount, zone_id, tax_category_id, included_in_price, created_at, updated_at, name, show_rate_in_label, deleted_at) FROM stdin;
1	0.10000	7	1	f	2022-07-12 18:13:10.50718	2022-07-12 18:13:10.50718	California	t	\N
\.


--
-- Data for Name: spree_taxonomies; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.spree_taxonomies (id, name, created_at, updated_at, "position", store_id, public_metadata, private_metadata) FROM stdin;
1	Categories	2022-07-12 18:13:13.006568	2022-07-12 18:21:47.455889	1	1	\N	\N
\.


--
-- Data for Name: spree_taxons; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.spree_taxons (id, parent_id, "position", name, permalink, taxonomy_id, lft, rgt, description, created_at, updated_at, meta_title, meta_description, meta_keywords, depth, hide_from_nav, public_metadata, private_metadata) FROM stdin;
19	1	0	Bestsellers	categories/bestsellers	1	36	37	\N	2022-07-12 18:13:16.160785	2022-07-12 18:15:52.1955	\N	\N	\N	1	f	\N	\N
22	1	0	Summer Sale	categories/summer-sale	1	42	43	\N	2022-07-12 18:13:16.467229	2022-07-12 18:15:52.503735	\N	\N	\N	1	f	\N	\N
6	2	0	T-shirts	categories/men/t-shirts	1	5	6	\N	2022-07-12 18:13:14.772583	2022-07-12 18:21:47.451992	\N	\N	\N	2	f	\N	\N
2	1	0	Men	categories/men	1	2	11	\N	2022-07-12 18:13:14.066114	2022-07-12 18:21:47.451992	\N	\N	\N	1	f	\N	\N
5	2	0	Shirts	categories/men/shirts	1	3	4	\N	2022-07-12 18:13:14.669299	2022-07-12 18:15:35.845786	\N	\N	\N	2	f	\N	\N
14	3	0	Jackets and Coats	categories/women/jackets-and-coats	1	23	24	\N	2022-07-12 18:13:15.638544	2022-07-12 18:15:50.033833	\N	\N	\N	2	f	\N	\N
16	4	0	Sweatshirts	categories/sportswear/sweatshirts	1	29	30	\N	2022-07-12 18:13:15.857299	2022-07-12 18:15:52.037445	\N	\N	\N	2	f	\N	\N
8	2	0	Jackets and Coats	categories/men/jackets-and-coats	1	9	10	\N	2022-07-12 18:13:14.992576	2022-07-12 18:15:39.819639	\N	\N	\N	2	f	\N	\N
12	3	0	Sweaters	categories/women/sweaters	1	19	20	\N	2022-07-12 18:13:15.426223	2022-07-12 18:15:46.679964	\N	\N	\N	2	f	\N	\N
17	4	0	Pants	categories/sportswear/pants	1	31	32	\N	2022-07-12 18:13:15.965595	2022-07-12 18:15:52.503735	\N	\N	\N	2	f	\N	\N
13	3	0	Tops and T-shirts	categories/women/tops-and-t-shirts	1	21	22	\N	2022-07-12 18:13:15.531105	2022-07-12 18:15:48.176793	\N	\N	\N	2	f	\N	\N
15	4	0	Tops	categories/sportswear/tops	1	27	28	\N	2022-07-12 18:13:15.744995	2022-07-12 18:15:51.273441	\N	\N	\N	2	f	\N	\N
7	2	0	Sweaters	categories/men/sweaters	1	7	8	\N	2022-07-12 18:13:14.88154	2022-07-12 18:15:38.186655	\N	\N	\N	2	f	\N	\N
11	3	0	Shirts and Blouses	categories/women/shirts-and-blouses	1	17	18	\N	2022-07-12 18:13:15.31452	2022-07-12 18:15:45.485191	\N	\N	\N	2	f	\N	\N
20	1	0	Trending	categories/trending	1	38	39	\N	2022-07-12 18:13:16.262337	2022-07-12 18:15:52.348914	\N	\N	\N	1	f	\N	\N
4	1	0	Sportswear	categories/sportswear	1	26	33	\N	2022-07-12 18:13:14.507804	2022-07-12 18:15:52.503735	\N	\N	\N	1	f	\N	\N
23	1	0	New Collection	categories/new-collection	1	44	47	\N	2022-07-12 18:13:16.563205	2022-07-12 18:21:47.451992	\N	\N	\N	1	f	\N	\N
24	23	0	Summer 2022	categories/new-collection/summer-2022	1	45	46	\N	2022-07-12 18:13:16.662554	2022-07-12 18:21:47.451992	\N	\N	\N	2	f	\N	\N
26	25	0	30% Off	categories/special-offers/30-percent-off	1	49	50	\N	2022-07-12 18:13:16.870063	2022-07-12 18:21:47.451992	\N	\N	\N	2	f	\N	\N
25	1	0	Special Offers	categories/special-offers	1	48	51	\N	2022-07-12 18:13:16.768627	2022-07-12 18:21:47.451992	\N	\N	\N	1	f	\N	\N
21	1	0	Streetstyle	categories/streetstyle	1	40	41	\N	2022-07-12 18:13:16.366224	2022-07-12 18:21:47.451992	\N	\N	\N	1	f	\N	\N
1	\N	0	Categories	categories	1	1	52	\N	2022-07-12 18:13:13.056398	2022-07-12 18:21:47.451992	\N	\N	\N	0	f	\N	\N
18	1	0	New	categories/new	1	34	35	\N	2022-07-12 18:13:16.06433	2022-07-12 18:15:51.742681	\N	\N	\N	1	f	\N	\N
3	1	0	Women	categories/women	1	12	25	\N	2022-07-12 18:13:14.257896	2022-07-12 18:15:50.033833	\N	\N	\N	1	f	\N	\N
9	3	0	Skirts	categories/women/skirts	1	13	14	\N	2022-07-12 18:13:15.099371	2022-07-12 18:15:41.418587	\N	\N	\N	2	f	\N	\N
10	3	0	Dresses	categories/women/dresses	1	15	16	\N	2022-07-12 18:13:15.206905	2022-07-12 18:15:43.444713	\N	\N	\N	2	f	\N	\N
\.


--
-- Data for Name: spree_trackers; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.spree_trackers (id, analytics_id, active, created_at, updated_at, engine) FROM stdin;
\.


--
-- Data for Name: spree_users; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.spree_users (id, encrypted_password, password_salt, email, remember_token, persistence_token, reset_password_token, perishable_token, sign_in_count, failed_attempts, last_request_at, current_sign_in_at, last_sign_in_at, current_sign_in_ip, last_sign_in_ip, login, ship_address_id, bill_address_id, authentication_token, unlock_token, locked_at, reset_password_sent_at, created_at, updated_at, public_metadata, private_metadata, spree_api_key, remember_created_at, deleted_at, confirmation_token, confirmed_at, confirmation_sent_at) FROM stdin;
1	017c17daa9432dadaa5e366efec930442e224fa0bce40875d2abbb4c646ad49634b75e54e463d7d8eb7b5589f34f4bb441eb23a93c9595fea90f77ccbc0187db	Z_xHp1AnU2Pym9r9i6Eo	spree@example.com	\N	\N	\N	\N	1	0	\N	2022-07-12 18:19:30.851865	2022-07-12 18:19:30.851865	192.168.112.1	192.168.112.1	spree@example.com	\N	\N	\N	\N	\N	\N	2022-07-12 18:10:57.963932	2022-07-12 18:19:30.852511	\N	\N	f1482a3e59937d82768703f510481ce883ee7a147ecee0f7	\N	\N	\N	\N	\N
\.


--
-- Data for Name: spree_variants; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.spree_variants (id, sku, weight, height, width, depth, deleted_at, is_master, product_id, cost_price, "position", cost_currency, track_inventory, tax_category_id, updated_at, discontinue_on, created_at, public_metadata, private_metadata) FROM stdin;
66	ShirtsandBlouses_floralshirt_72.99	0.00	\N	\N	\N	\N	t	66	\N	1	USD	t	\N	2022-07-12 18:15:32.533432	\N	2022-07-12 18:13:41.464928	\N	\N
127	Shirts_regularshirtwithrolledupsleeves_98.99_light_blue_xs	0.00	\N	\N	\N	\N	f	11	98.99	2	USD	t	1	2022-07-12 18:15:32.868502	\N	2022-07-12 18:15:14.492009	\N	\N
178	ShirtsandBlouses_pleatedsleevev-neckshirt_28.99_orange_xs	0.00	\N	\N	\N	\N	f	62	28.99	2	USD	t	1	2022-07-12 18:15:33.024774	\N	2022-07-12 18:15:24.188046	\N	\N
1	Shirts_denimshirt_24.99	0.00	\N	\N	\N	\N	t	1	\N	1	USD	t	\N	2022-07-12 18:15:32.600999	\N	2022-07-12 18:13:17.278307	\N	\N
2	Shirts_checkedshirt_65.99	0.00	\N	\N	\N	\N	t	2	\N	1	USD	t	\N	2022-07-12 18:15:32.685801	\N	2022-07-12 18:13:17.702715	\N	\N
228	Pants_printedpantswithholes_45.99_black_xs	0.00	\N	\N	\N	\N	f	112	45.99	2	USD	t	1	2022-07-12 18:15:33.521478	\N	2022-07-12 18:15:31.757608	\N	\N
14	T-shirts_3_4sleevet-shirt_18.99	0.00	\N	\N	\N	\N	t	14	\N	1	USD	t	\N	2022-07-12 18:21:47.417387	\N	2022-07-12 18:13:21.818352	\N	\N
229	Pants_pants_50.99_black_xs	0.00	\N	\N	\N	\N	f	113	50.99	2	USD	t	1	2022-07-12 18:15:33.684406	\N	2022-07-12 18:15:31.905511	\N	\N
3	Shirts_coveredplacketshirt_99.99	0.00	\N	\N	\N	\N	t	3	\N	1	USD	t	\N	2022-07-12 18:15:32.533432	\N	2022-07-12 18:13:18.106026	\N	\N
4	Shirts_slimfitshirt_17.99	0.00	\N	\N	\N	\N	t	4	\N	1	USD	t	\N	2022-07-12 18:15:32.533432	\N	2022-07-12 18:13:18.445029	\N	\N
5	Shirts_shortsleeveshirt_55.99	0.00	\N	\N	\N	\N	t	5	\N	1	USD	t	\N	2022-07-12 18:15:32.533432	\N	2022-07-12 18:13:18.775253	\N	\N
6	Shirts_printedshortsleeveshirt_74.99	0.00	\N	\N	\N	\N	t	6	\N	1	USD	t	\N	2022-07-12 18:15:32.533432	\N	2022-07-12 18:13:19.118316	\N	\N
7	Shirts_regularshirt_94.99	0.00	\N	\N	\N	\N	t	7	\N	1	USD	t	\N	2022-07-12 18:15:32.533432	\N	2022-07-12 18:13:19.457637	\N	\N
8	Shirts_checkedslimfitshirt_27.99	0.00	\N	\N	\N	\N	t	8	\N	1	USD	t	\N	2022-07-12 18:15:32.533432	\N	2022-07-12 18:13:19.795682	\N	\N
9	Shirts_dottedshirt_33.99	0.00	\N	\N	\N	\N	t	9	\N	1	USD	t	\N	2022-07-12 18:15:32.533432	\N	2022-07-12 18:13:20.142839	\N	\N
10	Shirts_linenshirt_87.99	0.00	\N	\N	\N	\N	t	10	\N	1	USD	t	\N	2022-07-12 18:15:32.533432	\N	2022-07-12 18:13:20.488531	\N	\N
11	Shirts_regularshirtwithrolledupsleeves_98.99	0.00	\N	\N	\N	\N	t	11	\N	1	USD	t	\N	2022-07-12 18:15:32.533432	\N	2022-07-12 18:13:20.818637	\N	\N
12	T-shirts_polot-shirt_52.99	0.00	\N	\N	\N	\N	t	12	\N	1	USD	t	\N	2022-07-12 18:15:32.533432	\N	2022-07-12 18:13:21.153267	\N	\N
13	T-shirts_longsleevet-shirt_28.99	0.00	\N	\N	\N	\N	t	13	\N	1	USD	t	\N	2022-07-12 18:15:32.533432	\N	2022-07-12 18:13:21.489469	\N	\N
15	T-shirts_t-shirtwithholes_34.99	0.00	\N	\N	\N	\N	t	15	\N	1	USD	t	\N	2022-07-12 18:15:32.533432	\N	2022-07-12 18:13:22.174284	\N	\N
16	T-shirts_raw-edget-shirt_84.99	0.00	\N	\N	\N	\N	t	16	\N	1	USD	t	\N	2022-07-12 18:15:32.533432	\N	2022-07-12 18:13:22.528645	\N	\N
17	T-shirts_v-neckt-shirt_47.99	0.00	\N	\N	\N	\N	t	17	\N	1	USD	t	\N	2022-07-12 18:15:32.533432	\N	2022-07-12 18:13:23.018076	\N	\N
18	T-shirts_tanktop_10.99	0.00	\N	\N	\N	\N	t	18	\N	1	USD	t	\N	2022-07-12 18:15:32.533432	\N	2022-07-12 18:13:23.365655	\N	\N
19	T-shirts_basict-shirt_23.99	0.00	\N	\N	\N	\N	t	19	\N	1	USD	t	\N	2022-07-12 18:15:32.533432	\N	2022-07-12 18:13:23.722793	\N	\N
20	Sweaters_highnecksweater_45.99	0.00	\N	\N	\N	\N	t	20	\N	1	USD	t	\N	2022-07-12 18:15:32.533432	\N	2022-07-12 18:13:24.097249	\N	\N
21	Sweaters_strippedjumper_88.99	0.00	\N	\N	\N	\N	t	21	\N	1	USD	t	\N	2022-07-12 18:15:32.533432	\N	2022-07-12 18:13:24.451456	\N	\N
22	Sweaters_longsleevejumperwithpocket_93.99	0.00	\N	\N	\N	\N	t	22	\N	1	USD	t	\N	2022-07-12 18:15:32.533432	\N	2022-07-12 18:13:24.81014	\N	\N
23	Sweaters_jumper_61.99	0.00	\N	\N	\N	\N	t	23	\N	1	USD	t	\N	2022-07-12 18:15:32.533432	\N	2022-07-12 18:13:25.155502	\N	\N
24	Sweaters_longsleevesweatshirt_73.99	0.00	\N	\N	\N	\N	t	24	\N	1	USD	t	\N	2022-07-12 18:15:32.533432	\N	2022-07-12 18:13:25.511834	\N	\N
25	Sweaters_hoodie_24.99	0.00	\N	\N	\N	\N	t	25	\N	1	USD	t	\N	2022-07-12 18:15:32.533432	\N	2022-07-12 18:13:25.873591	\N	\N
26	Sweaters_zippedhighnecksweater_67.99	0.00	\N	\N	\N	\N	t	26	\N	1	USD	t	\N	2022-07-12 18:15:32.533432	\N	2022-07-12 18:13:26.314655	\N	\N
27	Sweaters_longsleevejumper_64.99	0.00	\N	\N	\N	\N	t	27	\N	1	USD	t	\N	2022-07-12 18:15:32.533432	\N	2022-07-12 18:13:26.680535	\N	\N
28	JacketsandCoats_suedebikerjacket_33.99	0.00	\N	\N	\N	\N	t	28	\N	1	USD	t	\N	2022-07-12 18:15:32.533432	\N	2022-07-12 18:13:27.111087	\N	\N
29	JacketsandCoats_hoodedjacket_11.99	0.00	\N	\N	\N	\N	t	29	\N	1	USD	t	\N	2022-07-12 18:15:32.533432	\N	2022-07-12 18:13:27.519287	\N	\N
30	JacketsandCoats_anorakwithhood_44.99	0.00	\N	\N	\N	\N	t	30	\N	1	USD	t	\N	2022-07-12 18:15:32.533432	\N	2022-07-12 18:13:27.9051	\N	\N
31	JacketsandCoats_denimjacket_76.99	0.00	\N	\N	\N	\N	t	31	\N	1	USD	t	\N	2022-07-12 18:15:32.533432	\N	2022-07-12 18:13:28.368403	\N	\N
32	JacketsandCoats_wool-blendshortcoat_27.99	0.00	\N	\N	\N	\N	t	32	\N	1	USD	t	\N	2022-07-12 18:15:32.533432	\N	2022-07-12 18:13:28.883618	\N	\N
33	JacketsandCoats_downjacketwithhood_64.99	0.00	\N	\N	\N	\N	t	33	\N	1	USD	t	\N	2022-07-12 18:15:32.533432	\N	2022-07-12 18:13:29.251612	\N	\N
34	JacketsandCoats_wool-blendcoat_35.99	0.00	\N	\N	\N	\N	t	34	\N	1	USD	t	\N	2022-07-12 18:15:32.533432	\N	2022-07-12 18:13:29.611553	\N	\N
35	JacketsandCoats_jacketwithliner_73.99	0.00	\N	\N	\N	\N	t	35	\N	1	USD	t	\N	2022-07-12 18:15:32.533432	\N	2022-07-12 18:13:29.981032	\N	\N
36	Skirts_flaredmidiskirt_21.99	0.00	\N	\N	\N	\N	t	36	\N	1	USD	t	\N	2022-07-12 18:15:32.533432	\N	2022-07-12 18:13:30.344098	\N	\N
37	Skirts_midiskirtwithbottoms_40.99	0.00	\N	\N	\N	\N	t	37	\N	1	USD	t	\N	2022-07-12 18:15:32.533432	\N	2022-07-12 18:13:30.711966	\N	\N
38	Skirts_fittedskirt_62.99	0.00	\N	\N	\N	\N	t	38	\N	1	USD	t	\N	2022-07-12 18:15:32.533432	\N	2022-07-12 18:13:31.079813	\N	\N
39	Skirts_a-linesuedeskirt_30.99	0.00	\N	\N	\N	\N	t	39	\N	1	USD	t	\N	2022-07-12 18:15:32.533432	\N	2022-07-12 18:13:31.445057	\N	\N
40	Skirts_leatherskirtwithlacing_46.99	0.00	\N	\N	\N	\N	t	40	\N	1	USD	t	\N	2022-07-12 18:15:32.533432	\N	2022-07-12 18:13:31.803298	\N	\N
41	Skirts_flaredskirt_74.99	0.00	\N	\N	\N	\N	t	41	\N	1	USD	t	\N	2022-07-12 18:15:32.533432	\N	2022-07-12 18:13:32.160666	\N	\N
42	Skirts_skaterskirt_17.99	0.00	\N	\N	\N	\N	t	42	\N	1	USD	t	\N	2022-07-12 18:15:32.533432	\N	2022-07-12 18:13:32.524376	\N	\N
43	Skirts_skatershortskirt_67.99	0.00	\N	\N	\N	\N	t	43	\N	1	USD	t	\N	2022-07-12 18:15:32.533432	\N	2022-07-12 18:13:32.882839	\N	\N
44	Skirts_floralflaredskirt_10.99	0.00	\N	\N	\N	\N	t	44	\N	1	USD	t	\N	2022-07-12 18:15:32.533432	\N	2022-07-12 18:13:33.256328	\N	\N
45	Skirts_pleatedskirt2_17.99	0.00	\N	\N	\N	\N	t	45	\N	1	USD	t	\N	2022-07-12 18:15:32.533432	\N	2022-07-12 18:13:33.627405	\N	\N
46	Dresses_floralwrapdress_14.99	0.00	\N	\N	\N	\N	t	46	\N	1	USD	t	\N	2022-07-12 18:15:32.533432	\N	2022-07-12 18:13:34.149084	\N	\N
47	Dresses_v-neckfloralmaxidress_31.99	0.00	\N	\N	\N	\N	t	47	\N	1	USD	t	\N	2022-07-12 18:15:32.533432	\N	2022-07-12 18:13:34.52817	\N	\N
48	Dresses_flareddress_81.99	0.00	\N	\N	\N	\N	t	48	\N	1	USD	t	\N	2022-07-12 18:15:32.533432	\N	2022-07-12 18:13:34.899604	\N	\N
49	Dresses_elegantflareddress_55.99	0.00	\N	\N	\N	\N	t	49	\N	1	USD	t	\N	2022-07-12 18:15:32.533432	\N	2022-07-12 18:13:35.255036	\N	\N
50	Dresses_longsleeveknitteddress_23.99	0.00	\N	\N	\N	\N	t	50	\N	1	USD	t	\N	2022-07-12 18:15:32.533432	\N	2022-07-12 18:13:35.611949	\N	\N
51	Dresses_stripedshirtdress_87.99	0.00	\N	\N	\N	\N	t	51	\N	1	USD	t	\N	2022-07-12 18:15:32.533432	\N	2022-07-12 18:13:35.993896	\N	\N
52	Dresses_printeddress_83.99	0.00	\N	\N	\N	\N	t	52	\N	1	USD	t	\N	2022-07-12 18:15:32.533432	\N	2022-07-12 18:13:36.361534	\N	\N
53	Dresses_printedslit-sleevesdress_76.99	0.00	\N	\N	\N	\N	t	53	\N	1	USD	t	\N	2022-07-12 18:15:32.533432	\N	2022-07-12 18:13:36.725263	\N	\N
54	Dresses_dresswithbelt_36.99	0.00	\N	\N	\N	\N	t	54	\N	1	USD	t	\N	2022-07-12 18:15:32.533432	\N	2022-07-12 18:13:37.096464	\N	\N
55	Dresses_v-neckfloraldress_73.99	0.00	\N	\N	\N	\N	t	55	\N	1	USD	t	\N	2022-07-12 18:15:32.533432	\N	2022-07-12 18:13:37.452035	\N	\N
230	Pants_printedpants_45.99_grey_xs	0.00	\N	\N	\N	\N	f	114	45.99	2	USD	t	1	2022-07-12 18:15:33.828243	\N	2022-07-12 18:15:32.033717	\N	\N
231	Pants_highwaistpantswithpockets_92.99_pink_xs	0.00	\N	\N	\N	\N	f	115	92.99	2	USD	t	1	2022-07-12 18:15:34.012428	\N	2022-07-12 18:15:32.161467	\N	\N
56	Dresses_flounceddress_32.99	0.00	\N	\N	\N	\N	t	56	\N	1	USD	t	\N	2022-07-12 18:15:32.533432	\N	2022-07-12 18:13:37.833355	\N	\N
57	Dresses_slitmaxidress_26.99	0.00	\N	\N	\N	\N	t	57	\N	1	USD	t	\N	2022-07-12 18:15:32.533432	\N	2022-07-12 18:13:38.185924	\N	\N
58	ShirtsandBlouses_semi-sheershirtwithfloralcuffs_91.99	0.00	\N	\N	\N	\N	t	58	\N	1	USD	t	\N	2022-07-12 18:15:32.533432	\N	2022-07-12 18:13:38.530682	\N	\N
59	ShirtsandBlouses_stripedshirt_60.99	0.00	\N	\N	\N	\N	t	59	\N	1	USD	t	\N	2022-07-12 18:15:32.533432	\N	2022-07-12 18:13:38.87686	\N	\N
60	ShirtsandBlouses_v-neckwideshirt_68.99	0.00	\N	\N	\N	\N	t	60	\N	1	USD	t	\N	2022-07-12 18:15:32.533432	\N	2022-07-12 18:13:39.3651	\N	\N
61	ShirtsandBlouses_printedwrappedblouse_15.99	0.00	\N	\N	\N	\N	t	61	\N	1	USD	t	\N	2022-07-12 18:15:32.533432	\N	2022-07-12 18:13:39.721106	\N	\N
62	ShirtsandBlouses_pleatedsleevev-neckshirt_28.99	0.00	\N	\N	\N	\N	t	62	\N	1	USD	t	\N	2022-07-12 18:15:32.533432	\N	2022-07-12 18:13:40.07126	\N	\N
63	ShirtsandBlouses_cottonshirt_17.99	0.00	\N	\N	\N	\N	t	63	\N	1	USD	t	\N	2022-07-12 18:15:32.533432	\N	2022-07-12 18:13:40.404525	\N	\N
64	ShirtsandBlouses_blousewithwideflouncedsleeve_90.99	0.00	\N	\N	\N	\N	t	64	\N	1	USD	t	\N	2022-07-12 18:15:32.533432	\N	2022-07-12 18:13:40.75357	\N	\N
65	ShirtsandBlouses_elegantblousewithchocker_19.99	0.00	\N	\N	\N	\N	t	65	\N	1	USD	t	\N	2022-07-12 18:15:32.533432	\N	2022-07-12 18:13:41.093327	\N	\N
67	ShirtsandBlouses_semi-sheershirtwithpockets_36.99	0.00	\N	\N	\N	\N	t	67	\N	1	USD	t	\N	2022-07-12 18:15:32.533432	\N	2022-07-12 18:13:41.825593	\N	\N
68	ShirtsandBlouses_v-neckshirt_87.99	0.00	\N	\N	\N	\N	t	68	\N	1	USD	t	\N	2022-07-12 18:15:32.533432	\N	2022-07-12 18:13:42.212788	\N	\N
69	ShirtsandBlouses_printedshirt_46.99	0.00	\N	\N	\N	\N	t	69	\N	1	USD	t	\N	2022-07-12 18:15:32.533432	\N	2022-07-12 18:13:42.598927	\N	\N
70	Sweaters_asymmetricsweaterwithwidesleeves_34.99	0.00	\N	\N	\N	\N	t	70	\N	1	USD	t	\N	2022-07-12 18:15:32.533432	\N	2022-07-12 18:13:42.970167	\N	\N
71	Sweaters_oversizedknittedsweater_24.99	0.00	\N	\N	\N	\N	t	71	\N	1	USD	t	\N	2022-07-12 18:15:32.533432	\N	2022-07-12 18:13:43.3256	\N	\N
72	Sweaters_oversizedsweatshirt_86.99	0.00	\N	\N	\N	\N	t	72	\N	1	USD	t	\N	2022-07-12 18:15:32.533432	\N	2022-07-12 18:13:43.676766	\N	\N
73	Sweaters_knittedhighnecksweater_86.99	0.00	\N	\N	\N	\N	t	73	\N	1	USD	t	\N	2022-07-12 18:15:32.533432	\N	2022-07-12 18:13:44.049227	\N	\N
74	Sweaters_knittedv-necksweater_17.99	0.00	\N	\N	\N	\N	t	74	\N	1	USD	t	\N	2022-07-12 18:15:32.533432	\N	2022-07-12 18:13:44.438445	\N	\N
75	Sweaters_croppedfittedsweater_92.99	0.00	\N	\N	\N	\N	t	75	\N	1	USD	t	\N	2022-07-12 18:15:32.533432	\N	2022-07-12 18:13:44.985947	\N	\N
76	TopsandT-shirts_croptopwithtie_96.99	0.00	\N	\N	\N	\N	t	76	\N	1	USD	t	\N	2022-07-12 18:15:32.533432	\N	2022-07-12 18:13:45.362221	\N	\N
77	TopsandT-shirts_printedt-shirt_30.99	0.00	\N	\N	\N	\N	t	77	\N	1	USD	t	\N	2022-07-12 18:15:32.533432	\N	2022-07-12 18:13:45.768345	\N	\N
78	TopsandT-shirts_scrappytop_40.99	0.00	\N	\N	\N	\N	t	78	\N	1	USD	t	\N	2022-07-12 18:15:32.533432	\N	2022-07-12 18:13:46.53476	\N	\N
79	TopsandT-shirts_pleatedsleevet-shirt_83.99	0.00	\N	\N	\N	\N	t	79	\N	1	USD	t	\N	2022-07-12 18:15:32.533432	\N	2022-07-12 18:13:46.976331	\N	\N
80	TopsandT-shirts_scrappycroptopwithtie_46.99	0.00	\N	\N	\N	\N	t	80	\N	1	USD	t	\N	2022-07-12 18:15:32.533432	\N	2022-07-12 18:13:47.372456	\N	\N
81	TopsandT-shirts_croptop_60.99	0.00	\N	\N	\N	\N	t	81	\N	1	USD	t	\N	2022-07-12 18:15:32.533432	\N	2022-07-12 18:13:47.726298	\N	\N
82	TopsandT-shirts_looset-shirtwithpocketimitation_37.99	0.00	\N	\N	\N	\N	t	82	\N	1	USD	t	\N	2022-07-12 18:15:32.533432	\N	2022-07-12 18:13:48.073782	\N	\N
83	TopsandT-shirts_sleevelessloosetop_58.99	0.00	\N	\N	\N	\N	t	83	\N	1	USD	t	\N	2022-07-12 18:15:32.533432	\N	2022-07-12 18:13:48.448016	\N	\N
84	TopsandT-shirts_basiclooset-shirt_25.99	0.00	\N	\N	\N	\N	t	84	\N	1	USD	t	\N	2022-07-12 18:15:32.533432	\N	2022-07-12 18:13:48.839371	\N	\N
85	JacketsandCoats_coatwithpockets_27.99	0.00	\N	\N	\N	\N	t	85	\N	1	USD	t	\N	2022-07-12 18:15:32.533432	\N	2022-07-12 18:13:49.209388	\N	\N
86	JacketsandCoats_longwool-blendcoatwithbelt_43.99	0.00	\N	\N	\N	\N	t	86	\N	1	USD	t	\N	2022-07-12 18:15:32.533432	\N	2022-07-12 18:13:49.570722	\N	\N
87	JacketsandCoats_asymmetriccoat_19.99	0.00	\N	\N	\N	\N	t	87	\N	1	USD	t	\N	2022-07-12 18:15:32.533432	\N	2022-07-12 18:13:49.948975	\N	\N
88	JacketsandCoats_longcoatwithbelt_47.99	0.00	\N	\N	\N	\N	t	88	\N	1	USD	t	\N	2022-07-12 18:15:32.533432	\N	2022-07-12 18:13:50.318911	\N	\N
89	JacketsandCoats_downjacket_59.99	0.00	\N	\N	\N	\N	t	89	\N	1	USD	t	\N	2022-07-12 18:15:32.533432	\N	2022-07-12 18:13:50.867977	\N	\N
90	JacketsandCoats_zippedjacket_28.99	0.00	\N	\N	\N	\N	t	90	\N	1	USD	t	\N	2022-07-12 18:15:32.533432	\N	2022-07-12 18:13:51.278269	\N	\N
91	JacketsandCoats_loose-fittedjacket_43.99	0.00	\N	\N	\N	\N	t	91	\N	1	USD	t	\N	2022-07-12 18:15:32.533432	\N	2022-07-12 18:13:51.733944	\N	\N
92	JacketsandCoats_double-breastedjacket_50.99	0.00	\N	\N	\N	\N	t	92	\N	1	USD	t	\N	2022-07-12 18:15:32.533432	\N	2022-07-12 18:13:52.214767	\N	\N
93	JacketsandCoats_leatherbikerjacket_26.99	0.00	\N	\N	\N	\N	t	93	\N	1	USD	t	\N	2022-07-12 18:15:32.533432	\N	2022-07-12 18:13:52.596401	\N	\N
94	JacketsandCoats_wool-blendcoatwithbelt_13.99	0.00	\N	\N	\N	\N	t	94	\N	1	USD	t	\N	2022-07-12 18:15:32.533432	\N	2022-07-12 18:13:52.987407	\N	\N
95	JacketsandCoats_denimhoodedjacket_88.99	0.00	\N	\N	\N	\N	t	95	\N	1	USD	t	\N	2022-07-12 18:15:32.533432	\N	2022-07-12 18:13:53.349777	\N	\N
96	JacketsandCoats_bomberjacket_30.99	0.00	\N	\N	\N	\N	t	96	\N	1	USD	t	\N	2022-07-12 18:15:32.533432	\N	2022-07-12 18:13:53.785087	\N	\N
97	Tops_sportsbralowsupport_41.99	0.00	\N	\N	\N	\N	t	97	\N	1	USD	t	\N	2022-07-12 18:15:32.533432	\N	2022-07-12 18:13:54.146383	\N	\N
98	Tops_longsleevesyogacroptop_37.99	0.00	\N	\N	\N	\N	t	98	\N	1	USD	t	\N	2022-07-12 18:15:32.533432	\N	2022-07-12 18:13:54.491579	\N	\N
99	Tops_oversizet-shirtwrappedonback_76.99	0.00	\N	\N	\N	\N	t	99	\N	1	USD	t	\N	2022-07-12 18:15:32.533432	\N	2022-07-12 18:13:54.846809	\N	\N
100	Tops_longsleevescroptop_34.99	0.00	\N	\N	\N	\N	t	100	\N	1	USD	t	\N	2022-07-12 18:15:32.533432	\N	2022-07-12 18:13:55.201393	\N	\N
101	Tops_lacedcroptop_11.99	0.00	\N	\N	\N	\N	t	101	\N	1	USD	t	\N	2022-07-12 18:15:32.533432	\N	2022-07-12 18:13:55.55447	\N	\N
102	Tops_sportsbramediumsupport_29.99	0.00	\N	\N	\N	\N	t	102	\N	1	USD	t	\N	2022-07-12 18:15:32.533432	\N	2022-07-12 18:13:55.941681	\N	\N
103	Tops_sportsbra_79.99	0.00	\N	\N	\N	\N	t	103	\N	1	USD	t	\N	2022-07-12 18:15:32.533432	\N	2022-07-12 18:13:56.364974	\N	\N
104	Tops_sportcropptop_47.99	0.00	\N	\N	\N	\N	t	104	\N	1	USD	t	\N	2022-07-12 18:15:32.533432	\N	2022-07-12 18:13:56.85845	\N	\N
105	Sweatshirts_runningsweatshirt_17.99	0.00	\N	\N	\N	\N	t	105	\N	1	USD	t	\N	2022-07-12 18:15:32.533432	\N	2022-07-12 18:13:57.216205	\N	\N
106	Sweatshirts_lightweightrunningjacket_52.99	0.00	\N	\N	\N	\N	t	106	\N	1	USD	t	\N	2022-07-12 18:15:32.533432	\N	2022-07-12 18:13:57.602507	\N	\N
107	Sweatshirts_oversizesweatshirt_67.99	0.00	\N	\N	\N	\N	t	107	\N	1	USD	t	\N	2022-07-12 18:15:32.533432	\N	2022-07-12 18:13:57.977045	\N	\N
108	Sweatshirts_sportwindproofjacket_54.99	0.00	\N	\N	\N	\N	t	108	\N	1	USD	t	\N	2022-07-12 18:15:32.533432	\N	2022-07-12 18:13:58.33504	\N	\N
109	Sweatshirts_sportwaistcoat_71.99	0.00	\N	\N	\N	\N	t	109	\N	1	USD	t	\N	2022-07-12 18:15:32.533432	\N	2022-07-12 18:13:58.734436	\N	\N
110	Pants_shinedpants_73.99	0.00	\N	\N	\N	\N	t	110	\N	1	USD	t	\N	2022-07-12 18:15:32.533432	\N	2022-07-12 18:13:59.082328	\N	\N
111	Pants_shortpants_14.99	0.00	\N	\N	\N	\N	t	111	\N	1	USD	t	\N	2022-07-12 18:15:32.533432	\N	2022-07-12 18:13:59.435193	\N	\N
112	Pants_printedpantswithholes_45.99	0.00	\N	\N	\N	\N	t	112	\N	1	USD	t	\N	2022-07-12 18:15:32.533432	\N	2022-07-12 18:13:59.786966	\N	\N
113	Pants_pants_50.99	0.00	\N	\N	\N	\N	t	113	\N	1	USD	t	\N	2022-07-12 18:15:32.533432	\N	2022-07-12 18:14:00.22087	\N	\N
114	Pants_printedpants_45.99	0.00	\N	\N	\N	\N	t	114	\N	1	USD	t	\N	2022-07-12 18:15:32.533432	\N	2022-07-12 18:14:00.662845	\N	\N
115	Pants_highwaistpantswithpockets_92.99	0.00	\N	\N	\N	\N	t	115	\N	1	USD	t	\N	2022-07-12 18:15:32.533432	\N	2022-07-12 18:14:01.016981	\N	\N
116	Pants_highwaistpants_20.99	0.00	\N	\N	\N	\N	t	116	\N	1	USD	t	\N	2022-07-12 18:15:32.533432	\N	2022-07-12 18:14:01.365089	\N	\N
118	Shirts_checkedshirt_65.99_red_xs	0.00	\N	\N	\N	\N	f	2	65.99	2	USD	t	1	2022-07-12 18:15:34.637356	\N	2022-07-12 18:15:13.177339	\N	\N
119	Shirts_coveredplacketshirt_99.99_dark_blue_xs	0.00	\N	\N	\N	\N	f	3	99.99	2	USD	t	1	2022-07-12 18:15:34.784664	\N	2022-07-12 18:15:13.339516	\N	\N
122	Shirts_printedshortsleeveshirt_74.99_brown_xs	0.00	\N	\N	\N	\N	f	6	74.99	2	USD	t	1	2022-07-12 18:15:35.226474	\N	2022-07-12 18:15:13.800204	\N	\N
123	Shirts_regularshirt_94.99_blue_xs	0.00	\N	\N	\N	\N	f	7	94.99	2	USD	t	1	2022-07-12 18:15:35.368513	\N	2022-07-12 18:15:13.927919	\N	\N
124	Shirts_checkedslimfitshirt_27.99_black_xs	0.00	\N	\N	\N	\N	f	8	27.99	2	USD	t	1	2022-07-12 18:15:35.511831	\N	2022-07-12 18:15:14.059946	\N	\N
125	Shirts_dottedshirt_33.99_white_xs	0.00	\N	\N	\N	\N	f	9	33.99	2	USD	t	1	2022-07-12 18:15:35.659039	\N	2022-07-12 18:15:14.198049	\N	\N
126	Shirts_linenshirt_87.99_light_blue_xs	0.00	\N	\N	\N	\N	f	10	87.99	2	USD	t	1	2022-07-12 18:15:35.803641	\N	2022-07-12 18:15:14.338667	\N	\N
128	T-shirts_polot-shirt_52.99_light_blue_xs	0.00	\N	\N	\N	\N	f	12	52.99	2	USD	t	1	2022-07-12 18:15:35.9505	\N	2022-07-12 18:15:14.629967	\N	\N
129	T-shirts_longsleevet-shirt_28.99_grey_xs	0.00	\N	\N	\N	\N	f	13	28.99	2	USD	t	1	2022-07-12 18:15:36.103404	\N	2022-07-12 18:15:14.819033	\N	\N
130	T-shirts_3_4sleevet-shirt_18.99_white_xs	0.00	\N	\N	\N	\N	f	14	18.99	2	USD	t	1	2022-07-12 18:15:36.279689	\N	2022-07-12 18:15:14.952579	\N	\N
131	T-shirts_t-shirtwithholes_34.99_grey_xs	0.00	\N	\N	\N	\N	f	15	34.99	2	USD	t	1	2022-07-12 18:15:36.437805	\N	2022-07-12 18:15:15.088686	\N	\N
132	T-shirts_raw-edget-shirt_84.99_brown_xs	0.00	\N	\N	\N	\N	f	16	84.99	2	USD	t	1	2022-07-12 18:15:36.583259	\N	2022-07-12 18:15:15.226759	\N	\N
133	T-shirts_v-neckt-shirt_47.99_grey_xs	0.00	\N	\N	\N	\N	f	17	47.99	2	USD	t	1	2022-07-12 18:15:36.72265	\N	2022-07-12 18:15:15.402611	\N	\N
134	T-shirts_tanktop_10.99_pink_xs	0.00	\N	\N	\N	\N	f	18	10.99	2	USD	t	1	2022-07-12 18:15:36.859356	\N	2022-07-12 18:15:15.552987	\N	\N
135	T-shirts_basict-shirt_23.99_grey_xs	0.00	\N	\N	\N	\N	f	19	23.99	2	USD	t	1	2022-07-12 18:15:36.998474	\N	2022-07-12 18:15:15.685832	\N	\N
136	Sweaters_highnecksweater_45.99_black_xs	0.00	\N	\N	\N	\N	f	20	45.99	2	USD	t	1	2022-07-12 18:15:37.135817	\N	2022-07-12 18:15:15.868786	\N	\N
137	Sweaters_strippedjumper_88.99_brown_xs	0.00	\N	\N	\N	\N	f	21	88.99	2	USD	t	1	2022-07-12 18:15:37.284358	\N	2022-07-12 18:15:16.011332	\N	\N
138	Sweaters_longsleevejumperwithpocket_93.99_ecru_xs	0.00	\N	\N	\N	\N	f	22	93.99	2	USD	t	1	2022-07-12 18:15:37.421061	\N	2022-07-12 18:15:16.14429	\N	\N
139	Sweaters_jumper_61.99_grey_xs	0.00	\N	\N	\N	\N	f	23	61.99	2	USD	t	1	2022-07-12 18:15:37.566932	\N	2022-07-12 18:15:16.278994	\N	\N
140	Sweaters_longsleevesweatshirt_73.99_mint_xs	0.00	\N	\N	\N	\N	f	24	73.99	2	USD	t	1	2022-07-12 18:15:37.702971	\N	2022-07-12 18:15:16.42043	\N	\N
141	Sweaters_hoodie_24.99_grey_xs	0.00	\N	\N	\N	\N	f	25	24.99	2	USD	t	1	2022-07-12 18:15:37.839132	\N	2022-07-12 18:15:16.61067	\N	\N
142	Sweaters_zippedhighnecksweater_67.99_green_xs	0.00	\N	\N	\N	\N	f	26	67.99	2	USD	t	1	2022-07-12 18:15:37.9833	\N	2022-07-12 18:15:16.73958	\N	\N
143	Sweaters_longsleevejumper_64.99_dark_blue_xs	0.00	\N	\N	\N	\N	f	27	64.99	2	USD	t	1	2022-07-12 18:15:38.139614	\N	2022-07-12 18:15:16.86765	\N	\N
144	JacketsandCoats_suedebikerjacket_33.99_brown_xs	0.00	\N	\N	\N	\N	f	28	33.99	2	USD	t	1	2022-07-12 18:15:38.30754	\N	2022-07-12 18:15:17.027655	\N	\N
145	JacketsandCoats_hoodedjacket_11.99_beige_xs	0.00	\N	\N	\N	\N	f	29	11.99	2	USD	t	1	2022-07-12 18:15:38.478262	\N	2022-07-12 18:15:17.233116	\N	\N
146	JacketsandCoats_anorakwithhood_44.99_yellow_xs	0.00	\N	\N	\N	\N	f	30	44.99	2	USD	t	1	2022-07-12 18:15:38.832603	\N	2022-07-12 18:15:17.35957	\N	\N
147	JacketsandCoats_denimjacket_76.99_light_blue_xs	0.00	\N	\N	\N	\N	f	31	76.99	2	USD	t	1	2022-07-12 18:15:38.995044	\N	2022-07-12 18:15:17.519267	\N	\N
148	JacketsandCoats_wool-blendshortcoat_27.99_brown_xs	0.00	\N	\N	\N	\N	f	32	27.99	2	USD	t	1	2022-07-12 18:15:39.166893	\N	2022-07-12 18:15:17.656374	\N	\N
149	JacketsandCoats_downjacketwithhood_64.99_dark_blue_xs	0.00	\N	\N	\N	\N	f	33	64.99	2	USD	t	1	2022-07-12 18:15:39.32796	\N	2022-07-12 18:15:17.792208	\N	\N
150	JacketsandCoats_wool-blendcoat_35.99_beige_xs	0.00	\N	\N	\N	\N	f	34	35.99	2	USD	t	1	2022-07-12 18:15:39.603807	\N	2022-07-12 18:15:18.022671	\N	\N
151	JacketsandCoats_jacketwithliner_73.99_black_xs	0.00	\N	\N	\N	\N	f	35	73.99	2	USD	t	1	2022-07-12 18:15:39.775346	\N	2022-07-12 18:15:18.155236	\N	\N
152	Skirts_flaredmidiskirt_21.99_burgundy_mini_xs	0.00	\N	\N	\N	\N	f	36	21.99	2	USD	t	1	2022-07-12 18:15:39.940049	\N	2022-07-12 18:15:18.302424	\N	\N
153	Skirts_midiskirtwithbottoms_40.99_green_mini_xs	0.00	\N	\N	\N	\N	f	37	40.99	2	USD	t	1	2022-07-12 18:15:40.100282	\N	2022-07-12 18:15:18.46425	\N	\N
154	Skirts_fittedskirt_62.99_orange_mini_xs	0.00	\N	\N	\N	\N	f	38	62.99	2	USD	t	1	2022-07-12 18:15:40.263901	\N	2022-07-12 18:15:18.730967	\N	\N
155	Skirts_a-linesuedeskirt_30.99_dark_blue_mini_xs	0.00	\N	\N	\N	\N	f	39	30.99	2	USD	t	1	2022-07-12 18:15:40.436028	\N	2022-07-12 18:15:18.907441	\N	\N
156	Skirts_leatherskirtwithlacing_46.99_black_mini_xs	0.00	\N	\N	\N	\N	f	40	46.99	2	USD	t	1	2022-07-12 18:15:40.601779	\N	2022-07-12 18:15:19.12211	\N	\N
157	Skirts_flaredskirt_74.99_orange_mini_xs	0.00	\N	\N	\N	\N	f	41	74.99	2	USD	t	1	2022-07-12 18:15:40.773523	\N	2022-07-12 18:15:19.291507	\N	\N
158	Skirts_skaterskirt_17.99_brown_mini_xs	0.00	\N	\N	\N	\N	f	42	17.99	2	USD	t	1	2022-07-12 18:15:40.925428	\N	2022-07-12 18:15:19.469858	\N	\N
160	Skirts_floralflaredskirt_10.99_light_blue_mini_xs	0.00	\N	\N	\N	\N	f	44	10.99	2	USD	t	1	2022-07-12 18:15:41.216828	\N	2022-07-12 18:15:19.830645	\N	\N
161	Skirts_pleatedskirt2_17.99_green_mini_xs	0.00	\N	\N	\N	\N	f	45	17.99	2	USD	t	1	2022-07-12 18:15:41.374992	\N	2022-07-12 18:15:20.036528	\N	\N
162	Dresses_floralwrapdress_14.99_black_mini_xs	0.00	\N	\N	\N	\N	f	46	14.99	2	USD	t	1	2022-07-12 18:15:41.527779	\N	2022-07-12 18:15:20.424697	\N	\N
163	Dresses_v-neckfloralmaxidress_31.99_pink_mini_xs	0.00	\N	\N	\N	\N	f	47	31.99	2	USD	t	1	2022-07-12 18:15:41.706651	\N	2022-07-12 18:15:20.59315	\N	\N
164	Dresses_flareddress_81.99_red_mini_xs	0.00	\N	\N	\N	\N	f	48	81.99	2	USD	t	1	2022-07-12 18:15:41.871663	\N	2022-07-12 18:15:20.838618	\N	\N
165	Dresses_elegantflareddress_55.99_black_mini_xs	0.00	\N	\N	\N	\N	f	49	55.99	2	USD	t	1	2022-07-12 18:15:42.036727	\N	2022-07-12 18:15:21.047071	\N	\N
166	Dresses_longsleeveknitteddress_23.99_grey_mini_xs	0.00	\N	\N	\N	\N	f	50	23.99	2	USD	t	1	2022-07-12 18:15:42.221919	\N	2022-07-12 18:15:21.246726	\N	\N
167	Dresses_stripedshirtdress_87.99_light_blue_mini_xs	0.00	\N	\N	\N	\N	f	51	87.99	2	USD	t	1	2022-07-12 18:15:42.393487	\N	2022-07-12 18:15:21.503862	\N	\N
168	Dresses_printeddress_83.99_light_blue_mini_xs	0.00	\N	\N	\N	\N	f	52	83.99	2	USD	t	1	2022-07-12 18:15:42.541262	\N	2022-07-12 18:15:21.714444	\N	\N
169	Dresses_printedslit-sleevesdress_76.99_light_blue_mini_xs	0.00	\N	\N	\N	\N	f	53	76.99	2	USD	t	1	2022-07-12 18:15:42.700399	\N	2022-07-12 18:15:21.921309	\N	\N
170	Dresses_dresswithbelt_36.99_red_mini_xs	0.00	\N	\N	\N	\N	f	54	36.99	2	USD	t	1	2022-07-12 18:15:42.863299	\N	2022-07-12 18:15:22.197143	\N	\N
171	Dresses_v-neckfloraldress_73.99_light_blue_mini_xs	0.00	\N	\N	\N	\N	f	55	73.99	2	USD	t	1	2022-07-12 18:15:43.027001	\N	2022-07-12 18:15:22.625338	\N	\N
172	Dresses_flounceddress_32.99_beige_mini_xs	0.00	\N	\N	\N	\N	f	56	32.99	2	USD	t	1	2022-07-12 18:15:43.227236	\N	2022-07-12 18:15:23.201184	\N	\N
173	Dresses_slitmaxidress_26.99_red_mini_xs	0.00	\N	\N	\N	\N	f	57	26.99	2	USD	t	1	2022-07-12 18:15:43.400209	\N	2022-07-12 18:15:23.391595	\N	\N
174	ShirtsandBlouses_semi-sheershirtwithfloralcuffs_91.99_brown_xs	0.00	\N	\N	\N	\N	f	58	91.99	2	USD	t	1	2022-07-12 18:15:43.662439	\N	2022-07-12 18:15:23.560416	\N	\N
176	ShirtsandBlouses_v-neckwideshirt_68.99_dark_blue_xs	0.00	\N	\N	\N	\N	f	60	68.99	2	USD	t	1	2022-07-12 18:15:44.216356	\N	2022-07-12 18:15:23.86542	\N	\N
179	ShirtsandBlouses_cottonshirt_17.99_light_blue_xs	0.00	\N	\N	\N	\N	f	63	17.99	2	USD	t	1	2022-07-12 18:15:44.508371	\N	2022-07-12 18:15:24.320987	\N	\N
180	ShirtsandBlouses_blousewithwideflouncedsleeve_90.99_pink_xs	0.00	\N	\N	\N	\N	f	64	90.99	2	USD	t	1	2022-07-12 18:15:44.662089	\N	2022-07-12 18:15:24.447025	\N	\N
181	ShirtsandBlouses_elegantblousewithchocker_19.99_mint_xs	0.00	\N	\N	\N	\N	f	65	19.99	2	USD	t	1	2022-07-12 18:15:44.833223	\N	2022-07-12 18:15:24.582466	\N	\N
182	ShirtsandBlouses_floralshirt_72.99_pink_xs	0.00	\N	\N	\N	\N	f	66	72.99	2	USD	t	1	2022-07-12 18:15:44.982167	\N	2022-07-12 18:15:24.754232	\N	\N
183	ShirtsandBlouses_semi-sheershirtwithpockets_36.99_white_xs	0.00	\N	\N	\N	\N	f	67	36.99	2	USD	t	1	2022-07-12 18:15:45.140817	\N	2022-07-12 18:15:24.923064	\N	\N
184	ShirtsandBlouses_v-neckshirt_87.99_pink_xs	0.00	\N	\N	\N	\N	f	68	87.99	2	USD	t	1	2022-07-12 18:15:45.285815	\N	2022-07-12 18:15:25.057849	\N	\N
185	ShirtsandBlouses_printedshirt_46.99_green_xs	0.00	\N	\N	\N	\N	f	69	46.99	2	USD	t	1	2022-07-12 18:15:45.441699	\N	2022-07-12 18:15:25.217615	\N	\N
186	Sweaters_asymmetricsweaterwithwidesleeves_34.99_blue_xs	0.00	\N	\N	\N	\N	f	70	34.99	2	USD	t	1	2022-07-12 18:15:45.59734	\N	2022-07-12 18:15:25.364416	\N	\N
187	Sweaters_oversizedknittedsweater_24.99_red_xs	0.00	\N	\N	\N	\N	f	71	24.99	2	USD	t	1	2022-07-12 18:15:45.811453	\N	2022-07-12 18:15:25.582655	\N	\N
188	Sweaters_oversizedsweatshirt_86.99_brown_xs	0.00	\N	\N	\N	\N	f	72	86.99	2	USD	t	1	2022-07-12 18:15:46.007612	\N	2022-07-12 18:15:25.720664	\N	\N
189	Sweaters_knittedhighnecksweater_86.99_blue_xs	0.00	\N	\N	\N	\N	f	73	86.99	2	USD	t	1	2022-07-12 18:15:46.205421	\N	2022-07-12 18:15:25.850981	\N	\N
190	Sweaters_knittedv-necksweater_17.99_blue_xs	0.00	\N	\N	\N	\N	f	74	17.99	2	USD	t	1	2022-07-12 18:15:46.389317	\N	2022-07-12 18:15:26.03684	\N	\N
191	Sweaters_croppedfittedsweater_92.99_red_xs	0.00	\N	\N	\N	\N	f	75	92.99	2	USD	t	1	2022-07-12 18:15:46.615237	\N	2022-07-12 18:15:26.27123	\N	\N
192	TopsandT-shirts_croptopwithtie_96.99_red_xs	0.00	\N	\N	\N	\N	f	76	96.99	2	USD	t	1	2022-07-12 18:15:46.830632	\N	2022-07-12 18:15:26.423508	\N	\N
193	TopsandT-shirts_printedt-shirt_30.99_white_xs	0.00	\N	\N	\N	\N	f	77	30.99	2	USD	t	1	2022-07-12 18:15:46.991314	\N	2022-07-12 18:15:26.551833	\N	\N
194	TopsandT-shirts_scrappytop_40.99_black_xs	0.00	\N	\N	\N	\N	f	78	40.99	2	USD	t	1	2022-07-12 18:15:47.196975	\N	2022-07-12 18:15:26.713421	\N	\N
195	TopsandT-shirts_pleatedsleevet-shirt_83.99_beige_xs	0.00	\N	\N	\N	\N	f	79	83.99	2	USD	t	1	2022-07-12 18:15:47.354702	\N	2022-07-12 18:15:26.839638	\N	\N
196	TopsandT-shirts_scrappycroptopwithtie_46.99_grey_xs	0.00	\N	\N	\N	\N	f	80	46.99	2	USD	t	1	2022-07-12 18:15:47.513255	\N	2022-07-12 18:15:26.986256	\N	\N
197	TopsandT-shirts_croptop_60.99_black_xs	0.00	\N	\N	\N	\N	f	81	60.99	2	USD	t	1	2022-07-12 18:15:47.6681	\N	2022-07-12 18:15:27.113257	\N	\N
198	TopsandT-shirts_looset-shirtwithpocketimitation_37.99_white_xs	0.00	\N	\N	\N	\N	f	82	37.99	2	USD	t	1	2022-07-12 18:15:47.821106	\N	2022-07-12 18:15:27.265611	\N	\N
199	TopsandT-shirts_sleevelessloosetop_58.99_white_xs	0.00	\N	\N	\N	\N	f	83	58.99	2	USD	t	1	2022-07-12 18:15:47.978064	\N	2022-07-12 18:15:27.41567	\N	\N
200	TopsandT-shirts_basiclooset-shirt_25.99_green_xs	0.00	\N	\N	\N	\N	f	84	25.99	2	USD	t	1	2022-07-12 18:15:48.134726	\N	2022-07-12 18:15:27.543138	\N	\N
201	JacketsandCoats_coatwithpockets_27.99_pink_xs	0.00	\N	\N	\N	\N	f	85	27.99	2	USD	t	1	2022-07-12 18:15:48.286732	\N	2022-07-12 18:15:27.805748	\N	\N
202	JacketsandCoats_longwool-blendcoatwithbelt_43.99_dark_blue_xs	0.00	\N	\N	\N	\N	f	86	43.99	2	USD	t	1	2022-07-12 18:15:48.440241	\N	2022-07-12 18:15:27.992448	\N	\N
203	JacketsandCoats_asymmetriccoat_19.99_white_xs	0.00	\N	\N	\N	\N	f	87	19.99	2	USD	t	1	2022-07-12 18:15:48.614998	\N	2022-07-12 18:15:28.155011	\N	\N
204	JacketsandCoats_longcoatwithbelt_47.99_beige_xs	0.00	\N	\N	\N	\N	f	88	47.99	2	USD	t	1	2022-07-12 18:15:48.764793	\N	2022-07-12 18:15:28.284299	\N	\N
205	JacketsandCoats_downjacket_59.99_white_xs	0.00	\N	\N	\N	\N	f	89	59.99	2	USD	t	1	2022-07-12 18:15:48.910564	\N	2022-07-12 18:15:28.409217	\N	\N
206	JacketsandCoats_zippedjacket_28.99_blue_xs	0.00	\N	\N	\N	\N	f	90	28.99	2	USD	t	1	2022-07-12 18:15:49.074419	\N	2022-07-12 18:15:28.53186	\N	\N
207	JacketsandCoats_loose-fittedjacket_43.99_light_blue_xs	0.00	\N	\N	\N	\N	f	91	43.99	2	USD	t	1	2022-07-12 18:15:49.235316	\N	2022-07-12 18:15:28.666324	\N	\N
208	JacketsandCoats_double-breastedjacket_50.99_white_xs	0.00	\N	\N	\N	\N	f	92	50.99	2	USD	t	1	2022-07-12 18:15:49.387602	\N	2022-07-12 18:15:28.813987	\N	\N
209	JacketsandCoats_leatherbikerjacket_26.99_black_xs	0.00	\N	\N	\N	\N	f	93	26.99	2	USD	t	1	2022-07-12 18:15:49.542229	\N	2022-07-12 18:15:28.952222	\N	\N
210	JacketsandCoats_wool-blendcoatwithbelt_13.99_burgundy_xs	0.00	\N	\N	\N	\N	f	94	13.99	2	USD	t	1	2022-07-12 18:15:49.693701	\N	2022-07-12 18:15:29.084726	\N	\N
211	JacketsandCoats_denimhoodedjacket_88.99_blue_xs	0.00	\N	\N	\N	\N	f	95	88.99	2	USD	t	1	2022-07-12 18:15:49.843132	\N	2022-07-12 18:15:29.250644	\N	\N
212	JacketsandCoats_bomberjacket_30.99_khaki_xs	0.00	\N	\N	\N	\N	f	96	30.99	2	USD	t	1	2022-07-12 18:15:49.996352	\N	2022-07-12 18:15:29.390578	\N	\N
213	Tops_sportsbralowsupport_41.99_grey_xs	0.00	\N	\N	\N	\N	f	97	41.99	2	USD	t	1	2022-07-12 18:15:50.146985	\N	2022-07-12 18:15:29.519133	\N	\N
214	Tops_longsleevesyogacroptop_37.99_mint_xs	0.00	\N	\N	\N	\N	f	98	37.99	2	USD	t	1	2022-07-12 18:15:50.312462	\N	2022-07-12 18:15:29.679163	\N	\N
215	Tops_oversizet-shirtwrappedonback_76.99_pink_xs	0.00	\N	\N	\N	\N	f	99	76.99	2	USD	t	1	2022-07-12 18:15:50.463604	\N	2022-07-12 18:15:29.852532	\N	\N
216	Tops_longsleevescroptop_34.99_black_xs	0.00	\N	\N	\N	\N	f	100	34.99	2	USD	t	1	2022-07-12 18:15:50.615991	\N	2022-07-12 18:15:30.018305	\N	\N
217	Tops_lacedcroptop_11.99_black_xs	0.00	\N	\N	\N	\N	f	101	11.99	2	USD	t	1	2022-07-12 18:15:50.783428	\N	2022-07-12 18:15:30.159613	\N	\N
218	Tops_sportsbramediumsupport_29.99_black_xs	0.00	\N	\N	\N	\N	f	102	29.99	2	USD	t	1	2022-07-12 18:15:50.938174	\N	2022-07-12 18:15:30.289117	\N	\N
219	Tops_sportsbra_79.99_green_xs	0.00	\N	\N	\N	\N	f	103	79.99	2	USD	t	1	2022-07-12 18:15:51.089956	\N	2022-07-12 18:15:30.42087	\N	\N
220	Tops_sportcropptop_47.99_burgundy_xs	0.00	\N	\N	\N	\N	f	104	47.99	2	USD	t	1	2022-07-12 18:15:51.234153	\N	2022-07-12 18:15:30.598815	\N	\N
222	Sweatshirts_lightweightrunningjacket_52.99_grey_xs	0.00	\N	\N	\N	\N	f	106	52.99	2	USD	t	1	2022-07-12 18:15:51.547321	\N	2022-07-12 18:15:30.890381	\N	\N
223	Sweatshirts_oversizesweatshirt_67.99_pink_xs	0.00	\N	\N	\N	\N	f	107	67.99	2	USD	t	1	2022-07-12 18:15:51.70041	\N	2022-07-12 18:15:31.019412	\N	\N
224	Sweatshirts_sportwindproofjacket_54.99_blue_xs	0.00	\N	\N	\N	\N	f	108	54.99	2	USD	t	1	2022-07-12 18:15:51.851257	\N	2022-07-12 18:15:31.15113	\N	\N
225	Sweatshirts_sportwaistcoat_71.99_purple_xs	0.00	\N	\N	\N	\N	f	109	71.99	2	USD	t	1	2022-07-12 18:15:52.001689	\N	2022-07-12 18:15:31.299067	\N	\N
226	Pants_shinedpants_73.99_light_blue_xs	0.00	\N	\N	\N	\N	f	110	73.99	2	USD	t	1	2022-07-12 18:15:52.147133	\N	2022-07-12 18:15:31.432742	\N	\N
227	Pants_shortpants_14.99_black_xs	0.00	\N	\N	\N	\N	f	111	14.99	2	USD	t	1	2022-07-12 18:15:52.304437	\N	2022-07-12 18:15:31.61544	\N	\N
232	Pants_highwaistpants_20.99_blue_xs	0.00	\N	\N	\N	\N	f	116	20.99	2	USD	t	1	2022-07-12 18:15:52.459064	\N	2022-07-12 18:15:32.316211	\N	\N
117	Shirts_denimshirt_24.99_blue_xs	0.00	\N	\N	\N	\N	f	1	24.99	2	USD	t	1	2022-07-12 18:15:34.500283	\N	2022-07-12 18:15:12.939404	\N	\N
120	Shirts_slimfitshirt_17.99_dark_blue_xs	0.00	\N	\N	\N	\N	f	4	17.99	2	USD	t	1	2022-07-12 18:15:34.933966	\N	2022-07-12 18:15:13.500055	\N	\N
121	Shirts_shortsleeveshirt_55.99_burgundy_xs	0.00	\N	\N	\N	\N	f	5	55.99	2	USD	t	1	2022-07-12 18:15:35.072749	\N	2022-07-12 18:15:13.6705	\N	\N
159	Skirts_skatershortskirt_67.99_white_mini_xs	0.00	\N	\N	\N	\N	f	43	67.99	2	USD	t	1	2022-07-12 18:15:41.07166	\N	2022-07-12 18:15:19.637771	\N	\N
175	ShirtsandBlouses_stripedshirt_60.99_blue_xs	0.00	\N	\N	\N	\N	f	59	60.99	2	USD	t	1	2022-07-12 18:15:44.007589	\N	2022-07-12 18:15:23.708805	\N	\N
177	ShirtsandBlouses_printedwrappedblouse_15.99_white_xs	0.00	\N	\N	\N	\N	f	61	15.99	2	USD	t	1	2022-07-12 18:15:44.364232	\N	2022-07-12 18:15:24.041195	\N	\N
221	Sweatshirts_runningsweatshirt_17.99_light_blue_xs	0.00	\N	\N	\N	\N	f	105	17.99	2	USD	t	1	2022-07-12 18:15:51.389932	\N	2022-07-12 18:15:30.763151	\N	\N
\.


--
-- Data for Name: spree_webhooks_events; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.spree_webhooks_events (id, execution_time, name, request_errors, response_code, subscriber_id, success, url, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: spree_webhooks_subscribers; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.spree_webhooks_subscribers (id, url, active, subscriptions, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: spree_wished_items; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.spree_wished_items (id, variant_id, wishlist_id, quantity, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: spree_wishlists; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.spree_wishlists (id, user_id, store_id, name, token, is_private, is_default, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: spree_zone_members; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.spree_zone_members (id, zoneable_type, zoneable_id, zone_id, created_at, updated_at) FROM stdin;
1	Spree::Country	172	1	2022-07-12 18:10:10.405063	2022-07-12 18:10:10.405063
2	Spree::Country	66	1	2022-07-12 18:10:10.423231	2022-07-12 18:10:10.423231
3	Spree::Country	177	1	2022-07-12 18:10:10.440269	2022-07-12 18:10:10.440269
4	Spree::Country	182	1	2022-07-12 18:10:10.45837	2022-07-12 18:10:10.45837
5	Spree::Country	54	1	2022-07-12 18:10:10.475381	2022-07-12 18:10:10.475381
6	Spree::Country	71	1	2022-07-12 18:10:10.492976	2022-07-12 18:10:10.492976
7	Spree::Country	195	1	2022-07-12 18:10:10.5104	2022-07-12 18:10:10.5104
8	Spree::Country	94	1	2022-07-12 18:10:10.527591	2022-07-12 18:10:10.527591
9	Spree::Country	193	1	2022-07-12 18:10:10.544283	2022-07-12 18:10:10.544283
10	Spree::Country	96	1	2022-07-12 18:10:10.562074	2022-07-12 18:10:10.562074
11	Spree::Country	11	1	2022-07-12 18:10:10.578268	2022-07-12 18:10:10.578268
12	Spree::Country	64	1	2022-07-12 18:10:10.59627	2022-07-12 18:10:10.59627
13	Spree::Country	103	1	2022-07-12 18:10:10.614534	2022-07-12 18:10:10.614534
14	Spree::Country	18	1	2022-07-12 18:10:10.638549	2022-07-12 18:10:10.638549
15	Spree::Country	190	1	2022-07-12 18:10:10.657556	2022-07-12 18:10:10.657556
16	Spree::Country	128	1	2022-07-12 18:10:10.674166	2022-07-12 18:10:10.674166
17	Spree::Country	20	1	2022-07-12 18:10:10.691149	2022-07-12 18:10:10.691149
18	Spree::Country	126	1	2022-07-12 18:10:10.708295	2022-07-12 18:10:10.708295
19	Spree::Country	52	1	2022-07-12 18:10:10.726777	2022-07-12 18:10:10.726777
20	Spree::Country	127	1	2022-07-12 18:10:10.743693	2022-07-12 18:10:10.743693
21	Spree::Country	146	1	2022-07-12 18:10:10.760072	2022-07-12 18:10:10.760072
22	Spree::Country	56	1	2022-07-12 18:10:10.777237	2022-07-12 18:10:10.777237
23	Spree::Country	159	1	2022-07-12 18:10:10.795046	2022-07-12 18:10:10.795046
24	Spree::Country	61	1	2022-07-12 18:10:10.81281	2022-07-12 18:10:10.81281
25	Spree::Country	92	1	2022-07-12 18:10:10.829662	2022-07-12 18:10:10.829662
26	Spree::Country	53	1	2022-07-12 18:10:10.84629	2022-07-12 18:10:10.84629
27	Spree::Country	85	1	2022-07-12 18:10:10.863738	2022-07-12 18:10:10.863738
28	Spree::Country	73	2	2022-07-12 18:10:10.880336	2022-07-12 18:10:10.880336
29	Spree::Country	224	3	2022-07-12 18:10:10.896747	2022-07-12 18:10:10.896747
30	Spree::Country	35	3	2022-07-12 18:10:10.916171	2022-07-12 18:10:10.916171
31	Spree::Country	21	5	2022-07-12 18:10:10.933092	2022-07-12 18:10:10.933092
32	Spree::Country	52	5	2022-07-12 18:10:10.9515	2022-07-12 18:10:10.9515
33	Spree::Country	62	5	2022-07-12 18:10:10.96885	2022-07-12 18:10:10.96885
34	Spree::Country	101	5	2022-07-12 18:10:10.985735	2022-07-12 18:10:10.985735
35	Spree::Country	100	5	2022-07-12 18:10:11.002632	2022-07-12 18:10:11.002632
36	Spree::Country	97	5	2022-07-12 18:10:11.01869	2022-07-12 18:10:11.01869
37	Spree::Country	106	5	2022-07-12 18:10:11.035597	2022-07-12 18:10:11.035597
38	Spree::Country	116	5	2022-07-12 18:10:11.05289	2022-07-12 18:10:11.05289
39	Spree::Country	120	5	2022-07-12 18:10:11.068983	2022-07-12 18:10:11.068983
40	Spree::Country	165	5	2022-07-12 18:10:11.089914	2022-07-12 18:10:11.089914
41	Spree::Country	180	5	2022-07-12 18:10:11.113329	2022-07-12 18:10:11.113329
42	Spree::Country	186	5	2022-07-12 18:10:11.131276	2022-07-12 18:10:11.131276
43	Spree::Country	205	5	2022-07-12 18:10:11.147987	2022-07-12 18:10:11.147987
44	Spree::Country	217	5	2022-07-12 18:10:11.164353	2022-07-12 18:10:11.164353
45	Spree::Country	2	5	2022-07-12 18:10:11.180786	2022-07-12 18:10:11.180786
46	Spree::Country	236	5	2022-07-12 18:10:11.198545	2022-07-12 18:10:11.198545
47	Spree::Country	3	6	2022-07-12 18:10:11.214402	2022-07-12 18:10:11.214402
48	Spree::Country	7	6	2022-07-12 18:10:11.229682	2022-07-12 18:10:11.229682
49	Spree::Country	14	6	2022-07-12 18:10:11.245826	2022-07-12 18:10:11.245826
50	Spree::Country	21	6	2022-07-12 18:10:11.262439	2022-07-12 18:10:11.262439
51	Spree::Country	17	6	2022-07-12 18:10:11.281424	2022-07-12 18:10:11.281424
52	Spree::Country	31	6	2022-07-12 18:10:11.298955	2022-07-12 18:10:11.298955
53	Spree::Country	26	6	2022-07-12 18:10:11.315405	2022-07-12 18:10:11.315405
54	Spree::Country	110	6	2022-07-12 18:10:11.332458	2022-07-12 18:10:11.332458
55	Spree::Country	45	6	2022-07-12 18:10:11.351137	2022-07-12 18:10:11.351137
56	Spree::Country	51	6	2022-07-12 18:10:11.369967	2022-07-12 18:10:11.369967
57	Spree::Country	36	6	2022-07-12 18:10:11.387533	2022-07-12 18:10:11.387533
58	Spree::Country	75	6	2022-07-12 18:10:11.403646	2022-07-12 18:10:11.403646
59	Spree::Country	90	6	2022-07-12 18:10:11.419559	2022-07-12 18:10:11.419559
60	Spree::Country	99	6	2022-07-12 18:10:11.436056	2022-07-12 18:10:11.436056
61	Spree::Country	95	6	2022-07-12 18:10:11.452783	2022-07-12 18:10:11.452783
62	Spree::Country	101	6	2022-07-12 18:10:11.471894	2022-07-12 18:10:11.471894
63	Spree::Country	100	6	2022-07-12 18:10:11.490219	2022-07-12 18:10:11.490219
64	Spree::Country	97	6	2022-07-12 18:10:11.506642	2022-07-12 18:10:11.506642
65	Spree::Country	107	6	2022-07-12 18:10:11.524877	2022-07-12 18:10:11.524877
66	Spree::Country	106	6	2022-07-12 18:10:11.543176	2022-07-12 18:10:11.543176
67	Spree::Country	118	6	2022-07-12 18:10:11.56433	2022-07-12 18:10:11.56433
68	Spree::Country	116	6	2022-07-12 18:10:11.583863	2022-07-12 18:10:11.583863
69	Spree::Country	109	6	2022-07-12 18:10:11.601527	2022-07-12 18:10:11.601527
70	Spree::Country	119	6	2022-07-12 18:10:11.618043	2022-07-12 18:10:11.618043
71	Spree::Country	120	6	2022-07-12 18:10:11.638824	2022-07-12 18:10:11.638824
72	Spree::Country	141	6	2022-07-12 18:10:11.657621	2022-07-12 18:10:11.657621
73	Spree::Country	151	6	2022-07-12 18:10:11.676009	2022-07-12 18:10:11.676009
74	Spree::Country	148	6	2022-07-12 18:10:11.692075	2022-07-12 18:10:11.692075
75	Spree::Country	140	6	2022-07-12 18:10:11.707685	2022-07-12 18:10:11.707685
76	Spree::Country	139	6	2022-07-12 18:10:11.725046	2022-07-12 18:10:11.725046
77	Spree::Country	161	6	2022-07-12 18:10:11.743281	2022-07-12 18:10:11.743281
78	Spree::Country	114	6	2022-07-12 18:10:11.760208	2022-07-12 18:10:11.760208
79	Spree::Country	165	6	2022-07-12 18:10:11.776952	2022-07-12 18:10:11.776952
80	Spree::Country	171	6	2022-07-12 18:10:11.794199	2022-07-12 18:10:11.794199
81	Spree::Country	176	6	2022-07-12 18:10:11.810439	2022-07-12 18:10:11.810439
82	Spree::Country	170	6	2022-07-12 18:10:11.827316	2022-07-12 18:10:11.827316
83	Spree::Country	180	6	2022-07-12 18:10:11.843967	2022-07-12 18:10:11.843967
84	Spree::Country	186	6	2022-07-12 18:10:11.86304	2022-07-12 18:10:11.86304
85	Spree::Country	191	6	2022-07-12 18:10:11.879281	2022-07-12 18:10:11.879281
86	Spree::Country	115	6	2022-07-12 18:10:11.896992	2022-07-12 18:10:11.896992
87	Spree::Country	123	6	2022-07-12 18:10:11.913096	2022-07-12 18:10:11.913096
88	Spree::Country	205	6	2022-07-12 18:10:11.929124	2022-07-12 18:10:11.929124
89	Spree::Country	220	6	2022-07-12 18:10:11.946046	2022-07-12 18:10:11.946046
90	Spree::Country	211	6	2022-07-12 18:10:11.962519	2022-07-12 18:10:11.962519
91	Spree::Country	210	6	2022-07-12 18:10:11.978922	2022-07-12 18:10:11.978922
92	Spree::Country	217	6	2022-07-12 18:10:11.99946	2022-07-12 18:10:11.99946
93	Spree::Country	214	6	2022-07-12 18:10:12.017611	2022-07-12 18:10:12.017611
94	Spree::Country	2	6	2022-07-12 18:10:12.034187	2022-07-12 18:10:12.034187
95	Spree::Country	226	6	2022-07-12 18:10:12.05072	2022-07-12 18:10:12.05072
96	Spree::Country	232	6	2022-07-12 18:10:12.069239	2022-07-12 18:10:12.069239
97	Spree::Country	236	6	2022-07-12 18:10:12.086379	2022-07-12 18:10:12.086379
98	Spree::Country	9	4	2022-07-12 18:10:12.102346	2022-07-12 18:10:12.102346
99	Spree::Country	27	4	2022-07-12 18:10:12.119038	2022-07-12 18:10:12.119038
100	Spree::Country	29	4	2022-07-12 18:10:12.135968	2022-07-12 18:10:12.135968
101	Spree::Country	43	4	2022-07-12 18:10:12.153681	2022-07-12 18:10:12.153681
102	Spree::Country	46	4	2022-07-12 18:10:12.171475	2022-07-12 18:10:12.171475
103	Spree::Country	60	4	2022-07-12 18:10:12.189273	2022-07-12 18:10:12.189273
104	Spree::Country	68	4	2022-07-12 18:10:12.205847	2022-07-12 18:10:12.205847
105	Spree::Country	76	4	2022-07-12 18:10:12.222604	2022-07-12 18:10:12.222604
106	Spree::Country	89	4	2022-07-12 18:10:12.240487	2022-07-12 18:10:12.240487
107	Spree::Country	179	4	2022-07-12 18:10:12.257107	2022-07-12 18:10:12.257107
108	Spree::Country	167	4	2022-07-12 18:10:12.27388	2022-07-12 18:10:12.27388
109	Spree::Country	200	4	2022-07-12 18:10:12.291607	2022-07-12 18:10:12.291607
110	Spree::Country	225	4	2022-07-12 18:10:12.311388	2022-07-12 18:10:12.311388
111	Spree::Country	229	4	2022-07-12 18:10:12.32979	2022-07-12 18:10:12.32979
112	Spree::State	486	7	2022-07-12 18:13:09.542943	2022-07-12 18:13:09.542943
\.


--
-- Data for Name: spree_zones; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.spree_zones (id, name, description, default_tax, zone_members_count, created_at, updated_at, kind) FROM stdin;
6	Asia	Asia	f	51	2022-07-12 18:10:10.376548	2022-07-12 18:10:10.376548	country
1	EU_VAT	Countries that make up the EU VAT zone.	f	27	2022-07-12 18:10:10.305345	2022-07-12 18:10:10.305345	country
2	UK_VAT	\N	f	1	2022-07-12 18:10:10.325113	2022-07-12 18:10:10.325113	country
3	North America	USA + Canada	f	2	2022-07-12 18:10:10.338281	2022-07-12 18:10:10.338281	country
4	South America	South America	f	14	2022-07-12 18:10:10.3516	2022-07-12 18:10:10.3516	country
7	California Tax	California tax zone	f	1	2022-07-12 18:13:09.507712	2022-07-12 18:13:09.507712	state
5	Middle East	Middle East	f	16	2022-07-12 18:10:10.364145	2022-07-12 18:10:10.364145	country
\.


--
-- Name: action_mailbox_inbound_emails_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.action_mailbox_inbound_emails_id_seq', 1, false);


--
-- Name: action_text_rich_texts_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.action_text_rich_texts_id_seq', 1, false);


--
-- Name: active_storage_attachments_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.active_storage_attachments_id_seq', 2, true);


--
-- Name: active_storage_blobs_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.active_storage_blobs_id_seq', 2, true);


--
-- Name: active_storage_variant_records_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.active_storage_variant_records_id_seq', 1, true);


--
-- Name: friendly_id_slugs_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.friendly_id_slugs_id_seq', 142, true);


--
-- Name: spree_addresses_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.spree_addresses_id_seq', 2, true);


--
-- Name: spree_adjustments_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.spree_adjustments_id_seq', 2, true);


--
-- Name: spree_assets_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.spree_assets_id_seq', 1, true);


--
-- Name: spree_calculators_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.spree_calculators_id_seq', 6, true);


--
-- Name: spree_checks_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.spree_checks_id_seq', 1, false);


--
-- Name: spree_cms_pages_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.spree_cms_pages_id_seq', 36, true);


--
-- Name: spree_cms_sections_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.spree_cms_sections_id_seq', 72, true);


--
-- Name: spree_countries_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.spree_countries_id_seq', 240, true);


--
-- Name: spree_credit_cards_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.spree_credit_cards_id_seq', 1, true);


--
-- Name: spree_customer_returns_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.spree_customer_returns_id_seq', 1, false);


--
-- Name: spree_digital_links_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.spree_digital_links_id_seq', 1, false);


--
-- Name: spree_digitals_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.spree_digitals_id_seq', 1, false);


--
-- Name: spree_gateways_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.spree_gateways_id_seq', 1, false);


--
-- Name: spree_inventory_units_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.spree_inventory_units_id_seq', 2, true);


--
-- Name: spree_line_items_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.spree_line_items_id_seq', 2, true);


--
-- Name: spree_log_entries_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.spree_log_entries_id_seq', 1, false);


--
-- Name: spree_menu_items_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.spree_menu_items_id_seq', 276, true);


--
-- Name: spree_menus_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.spree_menus_id_seq', 12, true);


--
-- Name: spree_oauth_access_grants_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.spree_oauth_access_grants_id_seq', 1, false);


--
-- Name: spree_oauth_access_tokens_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.spree_oauth_access_tokens_id_seq', 1, true);


--
-- Name: spree_oauth_applications_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.spree_oauth_applications_id_seq', 1, true);


--
-- Name: spree_option_type_prototypes_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.spree_option_type_prototypes_id_seq', 1, false);


--
-- Name: spree_option_types_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.spree_option_types_id_seq', 3, true);


--
-- Name: spree_option_value_variants_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.spree_option_value_variants_id_seq', 254, true);


--
-- Name: spree_option_values_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.spree_option_values_id_seq', 27, true);


--
-- Name: spree_order_promotions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.spree_order_promotions_id_seq', 1, false);


--
-- Name: spree_orders_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.spree_orders_id_seq', 2, true);


--
-- Name: spree_payment_capture_events_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.spree_payment_capture_events_id_seq', 1, false);


--
-- Name: spree_payment_methods_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.spree_payment_methods_id_seq', 2, true);


--
-- Name: spree_payments_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.spree_payments_id_seq', 2, true);


--
-- Name: spree_preferences_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.spree_preferences_id_seq', 1, true);


--
-- Name: spree_prices_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.spree_prices_id_seq', 232, true);


--
-- Name: spree_product_option_types_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.spree_product_option_types_id_seq', 254, true);


--
-- Name: spree_product_promotion_rules_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.spree_product_promotion_rules_id_seq', 1, false);


--
-- Name: spree_product_properties_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.spree_product_properties_id_seq', 962, true);


--
-- Name: spree_products_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.spree_products_id_seq', 116, true);


--
-- Name: spree_products_stores_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.spree_products_stores_id_seq', 348, true);


--
-- Name: spree_products_taxons_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.spree_products_taxons_id_seq', 442, true);


--
-- Name: spree_promotion_action_line_items_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.spree_promotion_action_line_items_id_seq', 1, false);


--
-- Name: spree_promotion_actions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.spree_promotion_actions_id_seq', 1, true);


--
-- Name: spree_promotion_categories_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.spree_promotion_categories_id_seq', 1, false);


--
-- Name: spree_promotion_rule_taxons_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.spree_promotion_rule_taxons_id_seq', 1, false);


--
-- Name: spree_promotion_rule_users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.spree_promotion_rule_users_id_seq', 1, false);


--
-- Name: spree_promotion_rules_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.spree_promotion_rules_id_seq', 1, true);


--
-- Name: spree_promotions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.spree_promotions_id_seq', 1, true);


--
-- Name: spree_promotions_stores_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.spree_promotions_stores_id_seq', 3, true);


--
-- Name: spree_properties_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.spree_properties_id_seq', 16, true);


--
-- Name: spree_property_prototypes_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.spree_property_prototypes_id_seq', 13, true);


--
-- Name: spree_prototype_taxons_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.spree_prototype_taxons_id_seq', 1, false);


--
-- Name: spree_prototypes_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.spree_prototypes_id_seq', 3, true);


--
-- Name: spree_refund_reasons_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.spree_refund_reasons_id_seq', 1, true);


--
-- Name: spree_refunds_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.spree_refunds_id_seq', 1, false);


--
-- Name: spree_reimbursement_credits_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.spree_reimbursement_credits_id_seq', 1, false);


--
-- Name: spree_reimbursement_types_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.spree_reimbursement_types_id_seq', 1, false);


--
-- Name: spree_reimbursements_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.spree_reimbursements_id_seq', 1, true);


--
-- Name: spree_return_authorization_reasons_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.spree_return_authorization_reasons_id_seq', 9, true);


--
-- Name: spree_return_authorizations_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.spree_return_authorizations_id_seq', 1, false);


--
-- Name: spree_return_items_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.spree_return_items_id_seq', 1, false);


--
-- Name: spree_role_users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.spree_role_users_id_seq', 1, true);


--
-- Name: spree_roles_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.spree_roles_id_seq', 1, true);


--
-- Name: spree_shipments_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.spree_shipments_id_seq', 2, true);


--
-- Name: spree_shipping_categories_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.spree_shipping_categories_id_seq', 2, true);


--
-- Name: spree_shipping_method_categories_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.spree_shipping_method_categories_id_seq', 5, true);


--
-- Name: spree_shipping_method_zones_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.spree_shipping_method_zones_id_seq', 5, true);


--
-- Name: spree_shipping_methods_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.spree_shipping_methods_id_seq', 5, true);


--
-- Name: spree_shipping_rates_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.spree_shipping_rates_id_seq', 9, true);


--
-- Name: spree_state_changes_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.spree_state_changes_id_seq', 4, true);


--
-- Name: spree_states_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.spree_states_id_seq', 577, true);


--
-- Name: spree_stock_items_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.spree_stock_items_id_seq', 232, true);


--
-- Name: spree_stock_locations_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.spree_stock_locations_id_seq', 1, true);


--
-- Name: spree_stock_movements_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.spree_stock_movements_id_seq', 116, true);


--
-- Name: spree_stock_transfers_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.spree_stock_transfers_id_seq', 1, false);


--
-- Name: spree_store_credit_categories_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.spree_store_credit_categories_id_seq', 3, true);


--
-- Name: spree_store_credit_events_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.spree_store_credit_events_id_seq', 1, false);


--
-- Name: spree_store_credit_types_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.spree_store_credit_types_id_seq', 1, false);


--
-- Name: spree_store_credits_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.spree_store_credits_id_seq', 1, false);


--
-- Name: spree_stores_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.spree_stores_id_seq', 3, true);


--
-- Name: spree_tax_categories_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.spree_tax_categories_id_seq', 1, true);


--
-- Name: spree_tax_rates_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.spree_tax_rates_id_seq', 1, true);


--
-- Name: spree_taxonomies_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.spree_taxonomies_id_seq', 1, true);


--
-- Name: spree_taxons_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.spree_taxons_id_seq', 26, true);


--
-- Name: spree_trackers_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.spree_trackers_id_seq', 1, false);


--
-- Name: spree_users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.spree_users_id_seq', 1, true);


--
-- Name: spree_variants_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.spree_variants_id_seq', 232, true);


--
-- Name: spree_webhooks_events_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.spree_webhooks_events_id_seq', 1, false);


--
-- Name: spree_webhooks_subscribers_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.spree_webhooks_subscribers_id_seq', 1, false);


--
-- Name: spree_wished_items_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.spree_wished_items_id_seq', 1, false);


--
-- Name: spree_wishlists_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.spree_wishlists_id_seq', 1, false);


--
-- Name: spree_zone_members_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.spree_zone_members_id_seq', 112, true);


--
-- Name: spree_zones_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.spree_zones_id_seq', 7, true);


--
-- Name: action_mailbox_inbound_emails action_mailbox_inbound_emails_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.action_mailbox_inbound_emails
    ADD CONSTRAINT action_mailbox_inbound_emails_pkey PRIMARY KEY (id);


--
-- Name: action_text_rich_texts action_text_rich_texts_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.action_text_rich_texts
    ADD CONSTRAINT action_text_rich_texts_pkey PRIMARY KEY (id);


--
-- Name: active_storage_attachments active_storage_attachments_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.active_storage_attachments
    ADD CONSTRAINT active_storage_attachments_pkey PRIMARY KEY (id);


--
-- Name: active_storage_blobs active_storage_blobs_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.active_storage_blobs
    ADD CONSTRAINT active_storage_blobs_pkey PRIMARY KEY (id);


--
-- Name: active_storage_variant_records active_storage_variant_records_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.active_storage_variant_records
    ADD CONSTRAINT active_storage_variant_records_pkey PRIMARY KEY (id);


--
-- Name: ar_internal_metadata ar_internal_metadata_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ar_internal_metadata
    ADD CONSTRAINT ar_internal_metadata_pkey PRIMARY KEY (key);


--
-- Name: friendly_id_slugs friendly_id_slugs_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.friendly_id_slugs
    ADD CONSTRAINT friendly_id_slugs_pkey PRIMARY KEY (id);


--
-- Name: schema_migrations schema_migrations_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.schema_migrations
    ADD CONSTRAINT schema_migrations_pkey PRIMARY KEY (version);


--
-- Name: spree_addresses spree_addresses_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.spree_addresses
    ADD CONSTRAINT spree_addresses_pkey PRIMARY KEY (id);


--
-- Name: spree_adjustments spree_adjustments_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.spree_adjustments
    ADD CONSTRAINT spree_adjustments_pkey PRIMARY KEY (id);


--
-- Name: spree_assets spree_assets_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.spree_assets
    ADD CONSTRAINT spree_assets_pkey PRIMARY KEY (id);


--
-- Name: spree_calculators spree_calculators_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.spree_calculators
    ADD CONSTRAINT spree_calculators_pkey PRIMARY KEY (id);


--
-- Name: spree_checks spree_checks_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.spree_checks
    ADD CONSTRAINT spree_checks_pkey PRIMARY KEY (id);


--
-- Name: spree_cms_pages spree_cms_pages_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.spree_cms_pages
    ADD CONSTRAINT spree_cms_pages_pkey PRIMARY KEY (id);


--
-- Name: spree_cms_sections spree_cms_sections_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.spree_cms_sections
    ADD CONSTRAINT spree_cms_sections_pkey PRIMARY KEY (id);


--
-- Name: spree_countries spree_countries_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.spree_countries
    ADD CONSTRAINT spree_countries_pkey PRIMARY KEY (id);


--
-- Name: spree_credit_cards spree_credit_cards_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.spree_credit_cards
    ADD CONSTRAINT spree_credit_cards_pkey PRIMARY KEY (id);


--
-- Name: spree_customer_returns spree_customer_returns_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.spree_customer_returns
    ADD CONSTRAINT spree_customer_returns_pkey PRIMARY KEY (id);


--
-- Name: spree_digital_links spree_digital_links_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.spree_digital_links
    ADD CONSTRAINT spree_digital_links_pkey PRIMARY KEY (id);


--
-- Name: spree_digitals spree_digitals_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.spree_digitals
    ADD CONSTRAINT spree_digitals_pkey PRIMARY KEY (id);


--
-- Name: spree_gateways spree_gateways_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.spree_gateways
    ADD CONSTRAINT spree_gateways_pkey PRIMARY KEY (id);


--
-- Name: spree_inventory_units spree_inventory_units_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.spree_inventory_units
    ADD CONSTRAINT spree_inventory_units_pkey PRIMARY KEY (id);


--
-- Name: spree_line_items spree_line_items_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.spree_line_items
    ADD CONSTRAINT spree_line_items_pkey PRIMARY KEY (id);


--
-- Name: spree_log_entries spree_log_entries_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.spree_log_entries
    ADD CONSTRAINT spree_log_entries_pkey PRIMARY KEY (id);


--
-- Name: spree_menu_items spree_menu_items_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.spree_menu_items
    ADD CONSTRAINT spree_menu_items_pkey PRIMARY KEY (id);


--
-- Name: spree_menus spree_menus_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.spree_menus
    ADD CONSTRAINT spree_menus_pkey PRIMARY KEY (id);


--
-- Name: spree_oauth_access_grants spree_oauth_access_grants_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.spree_oauth_access_grants
    ADD CONSTRAINT spree_oauth_access_grants_pkey PRIMARY KEY (id);


--
-- Name: spree_oauth_access_tokens spree_oauth_access_tokens_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.spree_oauth_access_tokens
    ADD CONSTRAINT spree_oauth_access_tokens_pkey PRIMARY KEY (id);


--
-- Name: spree_oauth_applications spree_oauth_applications_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.spree_oauth_applications
    ADD CONSTRAINT spree_oauth_applications_pkey PRIMARY KEY (id);


--
-- Name: spree_option_type_prototypes spree_option_type_prototypes_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.spree_option_type_prototypes
    ADD CONSTRAINT spree_option_type_prototypes_pkey PRIMARY KEY (id);


--
-- Name: spree_option_types spree_option_types_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.spree_option_types
    ADD CONSTRAINT spree_option_types_pkey PRIMARY KEY (id);


--
-- Name: spree_option_value_variants spree_option_value_variants_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.spree_option_value_variants
    ADD CONSTRAINT spree_option_value_variants_pkey PRIMARY KEY (id);


--
-- Name: spree_option_values spree_option_values_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.spree_option_values
    ADD CONSTRAINT spree_option_values_pkey PRIMARY KEY (id);


--
-- Name: spree_order_promotions spree_order_promotions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.spree_order_promotions
    ADD CONSTRAINT spree_order_promotions_pkey PRIMARY KEY (id);


--
-- Name: spree_orders spree_orders_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.spree_orders
    ADD CONSTRAINT spree_orders_pkey PRIMARY KEY (id);


--
-- Name: spree_payment_capture_events spree_payment_capture_events_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.spree_payment_capture_events
    ADD CONSTRAINT spree_payment_capture_events_pkey PRIMARY KEY (id);


--
-- Name: spree_payment_methods spree_payment_methods_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.spree_payment_methods
    ADD CONSTRAINT spree_payment_methods_pkey PRIMARY KEY (id);


--
-- Name: spree_payments spree_payments_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.spree_payments
    ADD CONSTRAINT spree_payments_pkey PRIMARY KEY (id);


--
-- Name: spree_preferences spree_preferences_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.spree_preferences
    ADD CONSTRAINT spree_preferences_pkey PRIMARY KEY (id);


--
-- Name: spree_prices spree_prices_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.spree_prices
    ADD CONSTRAINT spree_prices_pkey PRIMARY KEY (id);


--
-- Name: spree_product_option_types spree_product_option_types_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.spree_product_option_types
    ADD CONSTRAINT spree_product_option_types_pkey PRIMARY KEY (id);


--
-- Name: spree_product_promotion_rules spree_product_promotion_rules_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.spree_product_promotion_rules
    ADD CONSTRAINT spree_product_promotion_rules_pkey PRIMARY KEY (id);


--
-- Name: spree_product_properties spree_product_properties_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.spree_product_properties
    ADD CONSTRAINT spree_product_properties_pkey PRIMARY KEY (id);


--
-- Name: spree_products spree_products_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.spree_products
    ADD CONSTRAINT spree_products_pkey PRIMARY KEY (id);


--
-- Name: spree_products_stores spree_products_stores_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.spree_products_stores
    ADD CONSTRAINT spree_products_stores_pkey PRIMARY KEY (id);


--
-- Name: spree_products_taxons spree_products_taxons_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.spree_products_taxons
    ADD CONSTRAINT spree_products_taxons_pkey PRIMARY KEY (id);


--
-- Name: spree_promotion_action_line_items spree_promotion_action_line_items_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.spree_promotion_action_line_items
    ADD CONSTRAINT spree_promotion_action_line_items_pkey PRIMARY KEY (id);


--
-- Name: spree_promotion_actions spree_promotion_actions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.spree_promotion_actions
    ADD CONSTRAINT spree_promotion_actions_pkey PRIMARY KEY (id);


--
-- Name: spree_promotion_categories spree_promotion_categories_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.spree_promotion_categories
    ADD CONSTRAINT spree_promotion_categories_pkey PRIMARY KEY (id);


--
-- Name: spree_promotion_rule_taxons spree_promotion_rule_taxons_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.spree_promotion_rule_taxons
    ADD CONSTRAINT spree_promotion_rule_taxons_pkey PRIMARY KEY (id);


--
-- Name: spree_promotion_rule_users spree_promotion_rule_users_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.spree_promotion_rule_users
    ADD CONSTRAINT spree_promotion_rule_users_pkey PRIMARY KEY (id);


--
-- Name: spree_promotion_rules spree_promotion_rules_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.spree_promotion_rules
    ADD CONSTRAINT spree_promotion_rules_pkey PRIMARY KEY (id);


--
-- Name: spree_promotions spree_promotions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.spree_promotions
    ADD CONSTRAINT spree_promotions_pkey PRIMARY KEY (id);


--
-- Name: spree_promotions_stores spree_promotions_stores_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.spree_promotions_stores
    ADD CONSTRAINT spree_promotions_stores_pkey PRIMARY KEY (id);


--
-- Name: spree_properties spree_properties_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.spree_properties
    ADD CONSTRAINT spree_properties_pkey PRIMARY KEY (id);


--
-- Name: spree_property_prototypes spree_property_prototypes_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.spree_property_prototypes
    ADD CONSTRAINT spree_property_prototypes_pkey PRIMARY KEY (id);


--
-- Name: spree_prototype_taxons spree_prototype_taxons_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.spree_prototype_taxons
    ADD CONSTRAINT spree_prototype_taxons_pkey PRIMARY KEY (id);


--
-- Name: spree_prototypes spree_prototypes_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.spree_prototypes
    ADD CONSTRAINT spree_prototypes_pkey PRIMARY KEY (id);


--
-- Name: spree_refund_reasons spree_refund_reasons_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.spree_refund_reasons
    ADD CONSTRAINT spree_refund_reasons_pkey PRIMARY KEY (id);


--
-- Name: spree_refunds spree_refunds_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.spree_refunds
    ADD CONSTRAINT spree_refunds_pkey PRIMARY KEY (id);


--
-- Name: spree_reimbursement_credits spree_reimbursement_credits_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.spree_reimbursement_credits
    ADD CONSTRAINT spree_reimbursement_credits_pkey PRIMARY KEY (id);


--
-- Name: spree_reimbursement_types spree_reimbursement_types_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.spree_reimbursement_types
    ADD CONSTRAINT spree_reimbursement_types_pkey PRIMARY KEY (id);


--
-- Name: spree_reimbursements spree_reimbursements_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.spree_reimbursements
    ADD CONSTRAINT spree_reimbursements_pkey PRIMARY KEY (id);


--
-- Name: spree_return_authorization_reasons spree_return_authorization_reasons_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.spree_return_authorization_reasons
    ADD CONSTRAINT spree_return_authorization_reasons_pkey PRIMARY KEY (id);


--
-- Name: spree_return_authorizations spree_return_authorizations_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.spree_return_authorizations
    ADD CONSTRAINT spree_return_authorizations_pkey PRIMARY KEY (id);


--
-- Name: spree_return_items spree_return_items_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.spree_return_items
    ADD CONSTRAINT spree_return_items_pkey PRIMARY KEY (id);


--
-- Name: spree_role_users spree_role_users_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.spree_role_users
    ADD CONSTRAINT spree_role_users_pkey PRIMARY KEY (id);


--
-- Name: spree_roles spree_roles_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.spree_roles
    ADD CONSTRAINT spree_roles_pkey PRIMARY KEY (id);


--
-- Name: spree_shipments spree_shipments_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.spree_shipments
    ADD CONSTRAINT spree_shipments_pkey PRIMARY KEY (id);


--
-- Name: spree_shipping_categories spree_shipping_categories_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.spree_shipping_categories
    ADD CONSTRAINT spree_shipping_categories_pkey PRIMARY KEY (id);


--
-- Name: spree_shipping_method_categories spree_shipping_method_categories_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.spree_shipping_method_categories
    ADD CONSTRAINT spree_shipping_method_categories_pkey PRIMARY KEY (id);


--
-- Name: spree_shipping_method_zones spree_shipping_method_zones_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.spree_shipping_method_zones
    ADD CONSTRAINT spree_shipping_method_zones_pkey PRIMARY KEY (id);


--
-- Name: spree_shipping_methods spree_shipping_methods_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.spree_shipping_methods
    ADD CONSTRAINT spree_shipping_methods_pkey PRIMARY KEY (id);


--
-- Name: spree_shipping_rates spree_shipping_rates_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.spree_shipping_rates
    ADD CONSTRAINT spree_shipping_rates_pkey PRIMARY KEY (id);


--
-- Name: spree_state_changes spree_state_changes_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.spree_state_changes
    ADD CONSTRAINT spree_state_changes_pkey PRIMARY KEY (id);


--
-- Name: spree_states spree_states_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.spree_states
    ADD CONSTRAINT spree_states_pkey PRIMARY KEY (id);


--
-- Name: spree_stock_items spree_stock_items_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.spree_stock_items
    ADD CONSTRAINT spree_stock_items_pkey PRIMARY KEY (id);


--
-- Name: spree_stock_locations spree_stock_locations_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.spree_stock_locations
    ADD CONSTRAINT spree_stock_locations_pkey PRIMARY KEY (id);


--
-- Name: spree_stock_movements spree_stock_movements_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.spree_stock_movements
    ADD CONSTRAINT spree_stock_movements_pkey PRIMARY KEY (id);


--
-- Name: spree_stock_transfers spree_stock_transfers_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.spree_stock_transfers
    ADD CONSTRAINT spree_stock_transfers_pkey PRIMARY KEY (id);


--
-- Name: spree_store_credit_categories spree_store_credit_categories_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.spree_store_credit_categories
    ADD CONSTRAINT spree_store_credit_categories_pkey PRIMARY KEY (id);


--
-- Name: spree_store_credit_events spree_store_credit_events_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.spree_store_credit_events
    ADD CONSTRAINT spree_store_credit_events_pkey PRIMARY KEY (id);


--
-- Name: spree_store_credit_types spree_store_credit_types_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.spree_store_credit_types
    ADD CONSTRAINT spree_store_credit_types_pkey PRIMARY KEY (id);


--
-- Name: spree_store_credits spree_store_credits_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.spree_store_credits
    ADD CONSTRAINT spree_store_credits_pkey PRIMARY KEY (id);


--
-- Name: spree_stores spree_stores_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.spree_stores
    ADD CONSTRAINT spree_stores_pkey PRIMARY KEY (id);


--
-- Name: spree_tax_categories spree_tax_categories_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.spree_tax_categories
    ADD CONSTRAINT spree_tax_categories_pkey PRIMARY KEY (id);


--
-- Name: spree_tax_rates spree_tax_rates_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.spree_tax_rates
    ADD CONSTRAINT spree_tax_rates_pkey PRIMARY KEY (id);


--
-- Name: spree_taxonomies spree_taxonomies_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.spree_taxonomies
    ADD CONSTRAINT spree_taxonomies_pkey PRIMARY KEY (id);


--
-- Name: spree_taxons spree_taxons_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.spree_taxons
    ADD CONSTRAINT spree_taxons_pkey PRIMARY KEY (id);


--
-- Name: spree_trackers spree_trackers_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.spree_trackers
    ADD CONSTRAINT spree_trackers_pkey PRIMARY KEY (id);


--
-- Name: spree_users spree_users_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.spree_users
    ADD CONSTRAINT spree_users_pkey PRIMARY KEY (id);


--
-- Name: spree_variants spree_variants_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.spree_variants
    ADD CONSTRAINT spree_variants_pkey PRIMARY KEY (id);


--
-- Name: spree_webhooks_events spree_webhooks_events_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.spree_webhooks_events
    ADD CONSTRAINT spree_webhooks_events_pkey PRIMARY KEY (id);


--
-- Name: spree_webhooks_subscribers spree_webhooks_subscribers_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.spree_webhooks_subscribers
    ADD CONSTRAINT spree_webhooks_subscribers_pkey PRIMARY KEY (id);


--
-- Name: spree_wished_items spree_wished_items_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.spree_wished_items
    ADD CONSTRAINT spree_wished_items_pkey PRIMARY KEY (id);


--
-- Name: spree_wishlists spree_wishlists_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.spree_wishlists
    ADD CONSTRAINT spree_wishlists_pkey PRIMARY KEY (id);


--
-- Name: spree_zone_members spree_zone_members_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.spree_zone_members
    ADD CONSTRAINT spree_zone_members_pkey PRIMARY KEY (id);


--
-- Name: spree_zones spree_zones_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.spree_zones
    ADD CONSTRAINT spree_zones_pkey PRIMARY KEY (id);


--
-- Name: email_idx_unique; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX email_idx_unique ON public.spree_users USING btree (email);


--
-- Name: index_action_mailbox_inbound_emails_uniqueness; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX index_action_mailbox_inbound_emails_uniqueness ON public.action_mailbox_inbound_emails USING btree (message_id, message_checksum);


--
-- Name: index_action_text_rich_texts_uniqueness; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX index_action_text_rich_texts_uniqueness ON public.action_text_rich_texts USING btree (record_type, record_id, name);


--
-- Name: index_active_storage_attachments_on_blob_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX index_active_storage_attachments_on_blob_id ON public.active_storage_attachments USING btree (blob_id);


--
-- Name: index_active_storage_attachments_uniqueness; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX index_active_storage_attachments_uniqueness ON public.active_storage_attachments USING btree (record_type, record_id, name, blob_id);


--
-- Name: index_active_storage_blobs_on_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX index_active_storage_blobs_on_key ON public.active_storage_blobs USING btree (key);


--
-- Name: index_active_storage_variant_records_uniqueness; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX index_active_storage_variant_records_uniqueness ON public.active_storage_variant_records USING btree (blob_id, variation_digest);


--
-- Name: index_addresses_on_firstname; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX index_addresses_on_firstname ON public.spree_addresses USING btree (firstname);


--
-- Name: index_addresses_on_lastname; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX index_addresses_on_lastname ON public.spree_addresses USING btree (lastname);


--
-- Name: index_assets_on_viewable_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX index_assets_on_viewable_id ON public.spree_assets USING btree (viewable_id);


--
-- Name: index_assets_on_viewable_type_and_type; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX index_assets_on_viewable_type_and_type ON public.spree_assets USING btree (viewable_type, type);


--
-- Name: index_friendly_id_slugs_on_deleted_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX index_friendly_id_slugs_on_deleted_at ON public.friendly_id_slugs USING btree (deleted_at);


--
-- Name: index_friendly_id_slugs_on_slug_and_sluggable_type; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX index_friendly_id_slugs_on_slug_and_sluggable_type ON public.friendly_id_slugs USING btree (slug, sluggable_type);


--
-- Name: index_friendly_id_slugs_on_slug_and_sluggable_type_and_scope; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX index_friendly_id_slugs_on_slug_and_sluggable_type_and_scope ON public.friendly_id_slugs USING btree (slug, sluggable_type, scope);


--
-- Name: index_friendly_id_slugs_on_sluggable_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX index_friendly_id_slugs_on_sluggable_id ON public.friendly_id_slugs USING btree (sluggable_id);


--
-- Name: index_friendly_id_slugs_on_sluggable_type; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX index_friendly_id_slugs_on_sluggable_type ON public.friendly_id_slugs USING btree (sluggable_type);


--
-- Name: index_inventory_units_on_order_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX index_inventory_units_on_order_id ON public.spree_inventory_units USING btree (order_id);


--
-- Name: index_inventory_units_on_shipment_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX index_inventory_units_on_shipment_id ON public.spree_inventory_units USING btree (shipment_id);


--
-- Name: index_inventory_units_on_variant_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX index_inventory_units_on_variant_id ON public.spree_inventory_units USING btree (variant_id);


--
-- Name: index_option_values_variants_on_variant_id_and_option_value_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX index_option_values_variants_on_variant_id_and_option_value_id ON public.spree_option_value_variants USING btree (variant_id, option_value_id);


--
-- Name: index_product_properties_on_product_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX index_product_properties_on_product_id ON public.spree_product_properties USING btree (product_id);


--
-- Name: index_products_promotion_rules_on_product_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX index_products_promotion_rules_on_product_id ON public.spree_product_promotion_rules USING btree (product_id);


--
-- Name: index_products_promotion_rules_on_promotion_rule_and_product; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX index_products_promotion_rules_on_promotion_rule_and_product ON public.spree_product_promotion_rules USING btree (promotion_rule_id, product_id);


--
-- Name: index_promotion_rules_on_product_group_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX index_promotion_rules_on_product_group_id ON public.spree_promotion_rules USING btree (product_group_id);


--
-- Name: index_promotion_rules_on_user_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX index_promotion_rules_on_user_id ON public.spree_promotion_rules USING btree (user_id);


--
-- Name: index_promotion_rules_users_on_promotion_rule_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX index_promotion_rules_users_on_promotion_rule_id ON public.spree_promotion_rule_users USING btree (promotion_rule_id);


--
-- Name: index_promotion_rules_users_on_user_id_and_promotion_rule_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX index_promotion_rules_users_on_user_id_and_promotion_rule_id ON public.spree_promotion_rule_users USING btree (user_id, promotion_rule_id);


--
-- Name: index_property_prototypes_on_prototype_id_and_property_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX index_property_prototypes_on_prototype_id_and_property_id ON public.spree_property_prototypes USING btree (prototype_id, property_id);


--
-- Name: index_refunds_on_refund_reason_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX index_refunds_on_refund_reason_id ON public.spree_refunds USING btree (refund_reason_id);


--
-- Name: index_reimbursement_credits_on_creditable_id_and_type; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX index_reimbursement_credits_on_creditable_id_and_type ON public.spree_reimbursement_credits USING btree (creditable_id, creditable_type);


--
-- Name: index_return_authorizations_on_return_authorization_reason_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX index_return_authorizations_on_return_authorization_reason_id ON public.spree_return_authorizations USING btree (return_authorization_reason_id);


--
-- Name: index_return_items_on_customer_return_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX index_return_items_on_customer_return_id ON public.spree_return_items USING btree (customer_return_id);


--
-- Name: index_spree_addresses_on_country_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX index_spree_addresses_on_country_id ON public.spree_addresses USING btree (country_id);


--
-- Name: index_spree_addresses_on_deleted_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX index_spree_addresses_on_deleted_at ON public.spree_addresses USING btree (deleted_at);


--
-- Name: index_spree_addresses_on_state_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX index_spree_addresses_on_state_id ON public.spree_addresses USING btree (state_id);


--
-- Name: index_spree_addresses_on_user_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX index_spree_addresses_on_user_id ON public.spree_addresses USING btree (user_id);


--
-- Name: index_spree_adjustments_on_adjustable_id_and_adjustable_type; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX index_spree_adjustments_on_adjustable_id_and_adjustable_type ON public.spree_adjustments USING btree (adjustable_id, adjustable_type);


--
-- Name: index_spree_adjustments_on_eligible; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX index_spree_adjustments_on_eligible ON public.spree_adjustments USING btree (eligible);


--
-- Name: index_spree_adjustments_on_order_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX index_spree_adjustments_on_order_id ON public.spree_adjustments USING btree (order_id);


--
-- Name: index_spree_adjustments_on_source_id_and_source_type; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX index_spree_adjustments_on_source_id_and_source_type ON public.spree_adjustments USING btree (source_id, source_type);


--
-- Name: index_spree_assets_on_position; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX index_spree_assets_on_position ON public.spree_assets USING btree ("position");


--
-- Name: index_spree_calculators_on_calculable_id_and_calculable_type; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX index_spree_calculators_on_calculable_id_and_calculable_type ON public.spree_calculators USING btree (calculable_id, calculable_type);


--
-- Name: index_spree_calculators_on_deleted_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX index_spree_calculators_on_deleted_at ON public.spree_calculators USING btree (deleted_at);


--
-- Name: index_spree_calculators_on_id_and_type; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX index_spree_calculators_on_id_and_type ON public.spree_calculators USING btree (id, type);


--
-- Name: index_spree_checks_on_payment_method_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX index_spree_checks_on_payment_method_id ON public.spree_checks USING btree (payment_method_id);


--
-- Name: index_spree_checks_on_user_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX index_spree_checks_on_user_id ON public.spree_checks USING btree (user_id);


--
-- Name: index_spree_cms_pages_on_deleted_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX index_spree_cms_pages_on_deleted_at ON public.spree_cms_pages USING btree (deleted_at);


--
-- Name: index_spree_cms_pages_on_slug_and_store_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX index_spree_cms_pages_on_slug_and_store_id ON public.spree_cms_pages USING btree (slug, store_id);


--
-- Name: index_spree_cms_pages_on_slug_and_store_id_and_deleted_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX index_spree_cms_pages_on_slug_and_store_id_and_deleted_at ON public.spree_cms_pages USING btree (slug, store_id, deleted_at);


--
-- Name: index_spree_cms_pages_on_store_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX index_spree_cms_pages_on_store_id ON public.spree_cms_pages USING btree (store_id);


--
-- Name: index_spree_cms_pages_on_store_id_and_locale_and_type; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX index_spree_cms_pages_on_store_id_and_locale_and_type ON public.spree_cms_pages USING btree (store_id, locale, type);


--
-- Name: index_spree_cms_pages_on_title_and_type_and_store_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX index_spree_cms_pages_on_title_and_type_and_store_id ON public.spree_cms_pages USING btree (title, type, store_id);


--
-- Name: index_spree_cms_pages_on_visible; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX index_spree_cms_pages_on_visible ON public.spree_cms_pages USING btree (visible);


--
-- Name: index_spree_cms_sections_on_cms_page_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX index_spree_cms_sections_on_cms_page_id ON public.spree_cms_sections USING btree (cms_page_id);


--
-- Name: index_spree_cms_sections_on_linked_resource; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX index_spree_cms_sections_on_linked_resource ON public.spree_cms_sections USING btree (linked_resource_type, linked_resource_id);


--
-- Name: index_spree_cms_sections_on_position; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX index_spree_cms_sections_on_position ON public.spree_cms_sections USING btree ("position");


--
-- Name: index_spree_cms_sections_on_type; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX index_spree_cms_sections_on_type ON public.spree_cms_sections USING btree (type);


--
-- Name: index_spree_countries_on_iso; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX index_spree_countries_on_iso ON public.spree_countries USING btree (iso);


--
-- Name: index_spree_countries_on_iso3; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX index_spree_countries_on_iso3 ON public.spree_countries USING btree (iso3);


--
-- Name: index_spree_countries_on_iso_name; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX index_spree_countries_on_iso_name ON public.spree_countries USING btree (iso_name);


--
-- Name: index_spree_countries_on_name; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX index_spree_countries_on_name ON public.spree_countries USING btree (name);


--
-- Name: index_spree_credit_cards_on_address_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX index_spree_credit_cards_on_address_id ON public.spree_credit_cards USING btree (address_id);


--
-- Name: index_spree_credit_cards_on_deleted_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX index_spree_credit_cards_on_deleted_at ON public.spree_credit_cards USING btree (deleted_at);


--
-- Name: index_spree_credit_cards_on_payment_method_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX index_spree_credit_cards_on_payment_method_id ON public.spree_credit_cards USING btree (payment_method_id);


--
-- Name: index_spree_credit_cards_on_user_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX index_spree_credit_cards_on_user_id ON public.spree_credit_cards USING btree (user_id);


--
-- Name: index_spree_customer_returns_on_number; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX index_spree_customer_returns_on_number ON public.spree_customer_returns USING btree (number);


--
-- Name: index_spree_customer_returns_on_stock_location_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX index_spree_customer_returns_on_stock_location_id ON public.spree_customer_returns USING btree (stock_location_id);


--
-- Name: index_spree_customer_returns_on_store_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX index_spree_customer_returns_on_store_id ON public.spree_customer_returns USING btree (store_id);


--
-- Name: index_spree_digital_links_on_digital_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX index_spree_digital_links_on_digital_id ON public.spree_digital_links USING btree (digital_id);


--
-- Name: index_spree_digital_links_on_line_item_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX index_spree_digital_links_on_line_item_id ON public.spree_digital_links USING btree (line_item_id);


--
-- Name: index_spree_digital_links_on_token; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX index_spree_digital_links_on_token ON public.spree_digital_links USING btree (token);


--
-- Name: index_spree_digitals_on_variant_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX index_spree_digitals_on_variant_id ON public.spree_digitals USING btree (variant_id);


--
-- Name: index_spree_gateways_on_active; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX index_spree_gateways_on_active ON public.spree_gateways USING btree (active);


--
-- Name: index_spree_gateways_on_test_mode; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX index_spree_gateways_on_test_mode ON public.spree_gateways USING btree (test_mode);


--
-- Name: index_spree_inventory_units_on_line_item_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX index_spree_inventory_units_on_line_item_id ON public.spree_inventory_units USING btree (line_item_id);


--
-- Name: index_spree_inventory_units_on_original_return_item_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX index_spree_inventory_units_on_original_return_item_id ON public.spree_inventory_units USING btree (original_return_item_id);


--
-- Name: index_spree_line_items_on_order_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX index_spree_line_items_on_order_id ON public.spree_line_items USING btree (order_id);


--
-- Name: index_spree_line_items_on_tax_category_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX index_spree_line_items_on_tax_category_id ON public.spree_line_items USING btree (tax_category_id);


--
-- Name: index_spree_line_items_on_variant_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX index_spree_line_items_on_variant_id ON public.spree_line_items USING btree (variant_id);


--
-- Name: index_spree_log_entries_on_source_id_and_source_type; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX index_spree_log_entries_on_source_id_and_source_type ON public.spree_log_entries USING btree (source_id, source_type);


--
-- Name: index_spree_menu_items_on_code; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX index_spree_menu_items_on_code ON public.spree_menu_items USING btree (code);


--
-- Name: index_spree_menu_items_on_depth; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX index_spree_menu_items_on_depth ON public.spree_menu_items USING btree (depth);


--
-- Name: index_spree_menu_items_on_item_type; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX index_spree_menu_items_on_item_type ON public.spree_menu_items USING btree (item_type);


--
-- Name: index_spree_menu_items_on_lft; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX index_spree_menu_items_on_lft ON public.spree_menu_items USING btree (lft);


--
-- Name: index_spree_menu_items_on_linked_resource; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX index_spree_menu_items_on_linked_resource ON public.spree_menu_items USING btree (linked_resource_type, linked_resource_id);


--
-- Name: index_spree_menu_items_on_menu_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX index_spree_menu_items_on_menu_id ON public.spree_menu_items USING btree (menu_id);


--
-- Name: index_spree_menu_items_on_parent_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX index_spree_menu_items_on_parent_id ON public.spree_menu_items USING btree (parent_id);


--
-- Name: index_spree_menu_items_on_rgt; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX index_spree_menu_items_on_rgt ON public.spree_menu_items USING btree (rgt);


--
-- Name: index_spree_menus_on_locale; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX index_spree_menus_on_locale ON public.spree_menus USING btree (locale);


--
-- Name: index_spree_menus_on_store_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX index_spree_menus_on_store_id ON public.spree_menus USING btree (store_id);


--
-- Name: index_spree_menus_on_store_id_and_location_and_locale; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX index_spree_menus_on_store_id_and_location_and_locale ON public.spree_menus USING btree (store_id, location, locale);


--
-- Name: index_spree_oauth_access_grants_on_application_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX index_spree_oauth_access_grants_on_application_id ON public.spree_oauth_access_grants USING btree (application_id);


--
-- Name: index_spree_oauth_access_grants_on_token; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX index_spree_oauth_access_grants_on_token ON public.spree_oauth_access_grants USING btree (token);


--
-- Name: index_spree_oauth_access_tokens_on_application_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX index_spree_oauth_access_tokens_on_application_id ON public.spree_oauth_access_tokens USING btree (application_id);


--
-- Name: index_spree_oauth_access_tokens_on_refresh_token; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX index_spree_oauth_access_tokens_on_refresh_token ON public.spree_oauth_access_tokens USING btree (refresh_token);


--
-- Name: index_spree_oauth_access_tokens_on_resource_owner_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX index_spree_oauth_access_tokens_on_resource_owner_id ON public.spree_oauth_access_tokens USING btree (resource_owner_id);


--
-- Name: index_spree_oauth_access_tokens_on_token; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX index_spree_oauth_access_tokens_on_token ON public.spree_oauth_access_tokens USING btree (token);


--
-- Name: index_spree_oauth_applications_on_uid; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX index_spree_oauth_applications_on_uid ON public.spree_oauth_applications USING btree (uid);


--
-- Name: index_spree_option_type_prototypes_on_option_type_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX index_spree_option_type_prototypes_on_option_type_id ON public.spree_option_type_prototypes USING btree (option_type_id);


--
-- Name: index_spree_option_type_prototypes_on_prototype_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX index_spree_option_type_prototypes_on_prototype_id ON public.spree_option_type_prototypes USING btree (prototype_id);


--
-- Name: index_spree_option_types_on_filterable; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX index_spree_option_types_on_filterable ON public.spree_option_types USING btree (filterable);


--
-- Name: index_spree_option_types_on_name; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX index_spree_option_types_on_name ON public.spree_option_types USING btree (name);


--
-- Name: index_spree_option_types_on_position; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX index_spree_option_types_on_position ON public.spree_option_types USING btree ("position");


--
-- Name: index_spree_option_value_variants_on_option_value_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX index_spree_option_value_variants_on_option_value_id ON public.spree_option_value_variants USING btree (option_value_id);


--
-- Name: index_spree_option_value_variants_on_variant_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX index_spree_option_value_variants_on_variant_id ON public.spree_option_value_variants USING btree (variant_id);


--
-- Name: index_spree_option_values_on_name; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX index_spree_option_values_on_name ON public.spree_option_values USING btree (name);


--
-- Name: index_spree_option_values_on_option_type_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX index_spree_option_values_on_option_type_id ON public.spree_option_values USING btree (option_type_id);


--
-- Name: index_spree_option_values_on_position; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX index_spree_option_values_on_position ON public.spree_option_values USING btree ("position");


--
-- Name: index_spree_order_promotions_on_order_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX index_spree_order_promotions_on_order_id ON public.spree_order_promotions USING btree (order_id);


--
-- Name: index_spree_order_promotions_on_promotion_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX index_spree_order_promotions_on_promotion_id ON public.spree_order_promotions USING btree (promotion_id);


--
-- Name: index_spree_order_promotions_on_promotion_id_and_order_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX index_spree_order_promotions_on_promotion_id_and_order_id ON public.spree_order_promotions USING btree (promotion_id, order_id);


--
-- Name: index_spree_orders_on_approver_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX index_spree_orders_on_approver_id ON public.spree_orders USING btree (approver_id);


--
-- Name: index_spree_orders_on_bill_address_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX index_spree_orders_on_bill_address_id ON public.spree_orders USING btree (bill_address_id);


--
-- Name: index_spree_orders_on_canceler_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX index_spree_orders_on_canceler_id ON public.spree_orders USING btree (canceler_id);


--
-- Name: index_spree_orders_on_completed_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX index_spree_orders_on_completed_at ON public.spree_orders USING btree (completed_at);


--
-- Name: index_spree_orders_on_confirmation_delivered; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX index_spree_orders_on_confirmation_delivered ON public.spree_orders USING btree (confirmation_delivered);


--
-- Name: index_spree_orders_on_considered_risky; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX index_spree_orders_on_considered_risky ON public.spree_orders USING btree (considered_risky);


--
-- Name: index_spree_orders_on_created_by_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX index_spree_orders_on_created_by_id ON public.spree_orders USING btree (created_by_id);


--
-- Name: index_spree_orders_on_number; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX index_spree_orders_on_number ON public.spree_orders USING btree (number);


--
-- Name: index_spree_orders_on_ship_address_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX index_spree_orders_on_ship_address_id ON public.spree_orders USING btree (ship_address_id);


--
-- Name: index_spree_orders_on_store_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX index_spree_orders_on_store_id ON public.spree_orders USING btree (store_id);


--
-- Name: index_spree_orders_on_token; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX index_spree_orders_on_token ON public.spree_orders USING btree (token);


--
-- Name: index_spree_orders_on_user_id_and_created_by_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX index_spree_orders_on_user_id_and_created_by_id ON public.spree_orders USING btree (user_id, created_by_id);


--
-- Name: index_spree_payment_capture_events_on_payment_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX index_spree_payment_capture_events_on_payment_id ON public.spree_payment_capture_events USING btree (payment_id);


--
-- Name: index_spree_payment_methods_on_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX index_spree_payment_methods_on_id ON public.spree_payment_methods USING btree (id);


--
-- Name: index_spree_payment_methods_on_id_and_type; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX index_spree_payment_methods_on_id_and_type ON public.spree_payment_methods USING btree (id, type);


--
-- Name: index_spree_payment_methods_stores_on_payment_method_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX index_spree_payment_methods_stores_on_payment_method_id ON public.spree_payment_methods_stores USING btree (payment_method_id);


--
-- Name: index_spree_payment_methods_stores_on_store_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX index_spree_payment_methods_stores_on_store_id ON public.spree_payment_methods_stores USING btree (store_id);


--
-- Name: index_spree_payments_on_number; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX index_spree_payments_on_number ON public.spree_payments USING btree (number);


--
-- Name: index_spree_payments_on_order_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX index_spree_payments_on_order_id ON public.spree_payments USING btree (order_id);


--
-- Name: index_spree_payments_on_payment_method_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX index_spree_payments_on_payment_method_id ON public.spree_payments USING btree (payment_method_id);


--
-- Name: index_spree_payments_on_source_id_and_source_type; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX index_spree_payments_on_source_id_and_source_type ON public.spree_payments USING btree (source_id, source_type);


--
-- Name: index_spree_preferences_on_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX index_spree_preferences_on_key ON public.spree_preferences USING btree (key);


--
-- Name: index_spree_prices_on_deleted_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX index_spree_prices_on_deleted_at ON public.spree_prices USING btree (deleted_at);


--
-- Name: index_spree_prices_on_variant_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX index_spree_prices_on_variant_id ON public.spree_prices USING btree (variant_id);


--
-- Name: index_spree_prices_on_variant_id_and_currency; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX index_spree_prices_on_variant_id_and_currency ON public.spree_prices USING btree (variant_id, currency);


--
-- Name: index_spree_product_option_types_on_option_type_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX index_spree_product_option_types_on_option_type_id ON public.spree_product_option_types USING btree (option_type_id);


--
-- Name: index_spree_product_option_types_on_position; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX index_spree_product_option_types_on_position ON public.spree_product_option_types USING btree ("position");


--
-- Name: index_spree_product_option_types_on_product_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX index_spree_product_option_types_on_product_id ON public.spree_product_option_types USING btree (product_id);


--
-- Name: index_spree_product_properties_on_filter_param; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX index_spree_product_properties_on_filter_param ON public.spree_product_properties USING btree (filter_param);


--
-- Name: index_spree_product_properties_on_position; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX index_spree_product_properties_on_position ON public.spree_product_properties USING btree ("position");


--
-- Name: index_spree_product_properties_on_property_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX index_spree_product_properties_on_property_id ON public.spree_product_properties USING btree (property_id);


--
-- Name: index_spree_product_properties_on_property_id_and_product_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX index_spree_product_properties_on_property_id_and_product_id ON public.spree_product_properties USING btree (property_id, product_id);


--
-- Name: index_spree_products_on_available_on; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX index_spree_products_on_available_on ON public.spree_products USING btree (available_on);


--
-- Name: index_spree_products_on_deleted_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX index_spree_products_on_deleted_at ON public.spree_products USING btree (deleted_at);


--
-- Name: index_spree_products_on_discontinue_on; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX index_spree_products_on_discontinue_on ON public.spree_products USING btree (discontinue_on);


--
-- Name: index_spree_products_on_name; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX index_spree_products_on_name ON public.spree_products USING btree (name);


--
-- Name: index_spree_products_on_shipping_category_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX index_spree_products_on_shipping_category_id ON public.spree_products USING btree (shipping_category_id);


--
-- Name: index_spree_products_on_slug; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX index_spree_products_on_slug ON public.spree_products USING btree (slug);


--
-- Name: index_spree_products_on_tax_category_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX index_spree_products_on_tax_category_id ON public.spree_products USING btree (tax_category_id);


--
-- Name: index_spree_products_stores_on_product_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX index_spree_products_stores_on_product_id ON public.spree_products_stores USING btree (product_id);


--
-- Name: index_spree_products_stores_on_product_id_and_store_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX index_spree_products_stores_on_product_id_and_store_id ON public.spree_products_stores USING btree (product_id, store_id);


--
-- Name: index_spree_products_stores_on_store_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX index_spree_products_stores_on_store_id ON public.spree_products_stores USING btree (store_id);


--
-- Name: index_spree_products_taxons_on_position; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX index_spree_products_taxons_on_position ON public.spree_products_taxons USING btree ("position");


--
-- Name: index_spree_products_taxons_on_product_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX index_spree_products_taxons_on_product_id ON public.spree_products_taxons USING btree (product_id);


--
-- Name: index_spree_products_taxons_on_product_id_and_taxon_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX index_spree_products_taxons_on_product_id_and_taxon_id ON public.spree_products_taxons USING btree (product_id, taxon_id);


--
-- Name: index_spree_products_taxons_on_taxon_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX index_spree_products_taxons_on_taxon_id ON public.spree_products_taxons USING btree (taxon_id);


--
-- Name: index_spree_promotion_action_line_items_on_promotion_action_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX index_spree_promotion_action_line_items_on_promotion_action_id ON public.spree_promotion_action_line_items USING btree (promotion_action_id);


--
-- Name: index_spree_promotion_action_line_items_on_variant_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX index_spree_promotion_action_line_items_on_variant_id ON public.spree_promotion_action_line_items USING btree (variant_id);


--
-- Name: index_spree_promotion_actions_on_deleted_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX index_spree_promotion_actions_on_deleted_at ON public.spree_promotion_actions USING btree (deleted_at);


--
-- Name: index_spree_promotion_actions_on_id_and_type; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX index_spree_promotion_actions_on_id_and_type ON public.spree_promotion_actions USING btree (id, type);


--
-- Name: index_spree_promotion_actions_on_promotion_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX index_spree_promotion_actions_on_promotion_id ON public.spree_promotion_actions USING btree (promotion_id);


--
-- Name: index_spree_promotion_rule_taxons_on_promotion_rule_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX index_spree_promotion_rule_taxons_on_promotion_rule_id ON public.spree_promotion_rule_taxons USING btree (promotion_rule_id);


--
-- Name: index_spree_promotion_rule_taxons_on_taxon_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX index_spree_promotion_rule_taxons_on_taxon_id ON public.spree_promotion_rule_taxons USING btree (taxon_id);


--
-- Name: index_spree_promotion_rules_on_promotion_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX index_spree_promotion_rules_on_promotion_id ON public.spree_promotion_rules USING btree (promotion_id);


--
-- Name: index_spree_promotions_on_advertise; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX index_spree_promotions_on_advertise ON public.spree_promotions USING btree (advertise);


--
-- Name: index_spree_promotions_on_code; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX index_spree_promotions_on_code ON public.spree_promotions USING btree (code);


--
-- Name: index_spree_promotions_on_expires_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX index_spree_promotions_on_expires_at ON public.spree_promotions USING btree (expires_at);


--
-- Name: index_spree_promotions_on_id_and_type; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX index_spree_promotions_on_id_and_type ON public.spree_promotions USING btree (id, type);


--
-- Name: index_spree_promotions_on_path; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX index_spree_promotions_on_path ON public.spree_promotions USING btree (path);


--
-- Name: index_spree_promotions_on_promotion_category_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX index_spree_promotions_on_promotion_category_id ON public.spree_promotions USING btree (promotion_category_id);


--
-- Name: index_spree_promotions_on_starts_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX index_spree_promotions_on_starts_at ON public.spree_promotions USING btree (starts_at);


--
-- Name: index_spree_promotions_stores_on_promotion_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX index_spree_promotions_stores_on_promotion_id ON public.spree_promotions_stores USING btree (promotion_id);


--
-- Name: index_spree_promotions_stores_on_promotion_id_and_store_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX index_spree_promotions_stores_on_promotion_id_and_store_id ON public.spree_promotions_stores USING btree (promotion_id, store_id);


--
-- Name: index_spree_promotions_stores_on_store_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX index_spree_promotions_stores_on_store_id ON public.spree_promotions_stores USING btree (store_id);


--
-- Name: index_spree_properties_on_filter_param; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX index_spree_properties_on_filter_param ON public.spree_properties USING btree (filter_param);


--
-- Name: index_spree_properties_on_filterable; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX index_spree_properties_on_filterable ON public.spree_properties USING btree (filterable);


--
-- Name: index_spree_properties_on_name; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX index_spree_properties_on_name ON public.spree_properties USING btree (name);


--
-- Name: index_spree_property_prototypes_on_property_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX index_spree_property_prototypes_on_property_id ON public.spree_property_prototypes USING btree (property_id);


--
-- Name: index_spree_property_prototypes_on_prototype_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX index_spree_property_prototypes_on_prototype_id ON public.spree_property_prototypes USING btree (prototype_id);


--
-- Name: index_spree_prototype_taxons_on_prototype_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX index_spree_prototype_taxons_on_prototype_id ON public.spree_prototype_taxons USING btree (prototype_id);


--
-- Name: index_spree_prototype_taxons_on_prototype_id_and_taxon_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX index_spree_prototype_taxons_on_prototype_id_and_taxon_id ON public.spree_prototype_taxons USING btree (prototype_id, taxon_id);


--
-- Name: index_spree_prototype_taxons_on_taxon_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX index_spree_prototype_taxons_on_taxon_id ON public.spree_prototype_taxons USING btree (taxon_id);


--
-- Name: index_spree_refund_reasons_on_name; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX index_spree_refund_reasons_on_name ON public.spree_refund_reasons USING btree (name);


--
-- Name: index_spree_refunds_on_payment_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX index_spree_refunds_on_payment_id ON public.spree_refunds USING btree (payment_id);


--
-- Name: index_spree_refunds_on_reimbursement_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX index_spree_refunds_on_reimbursement_id ON public.spree_refunds USING btree (reimbursement_id);


--
-- Name: index_spree_reimbursement_credits_on_reimbursement_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX index_spree_reimbursement_credits_on_reimbursement_id ON public.spree_reimbursement_credits USING btree (reimbursement_id);


--
-- Name: index_spree_reimbursement_types_on_name; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX index_spree_reimbursement_types_on_name ON public.spree_reimbursement_types USING btree (name);


--
-- Name: index_spree_reimbursement_types_on_type; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX index_spree_reimbursement_types_on_type ON public.spree_reimbursement_types USING btree (type);


--
-- Name: index_spree_reimbursements_on_customer_return_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX index_spree_reimbursements_on_customer_return_id ON public.spree_reimbursements USING btree (customer_return_id);


--
-- Name: index_spree_reimbursements_on_number; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX index_spree_reimbursements_on_number ON public.spree_reimbursements USING btree (number);


--
-- Name: index_spree_reimbursements_on_order_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX index_spree_reimbursements_on_order_id ON public.spree_reimbursements USING btree (order_id);


--
-- Name: index_spree_return_authorization_reasons_on_name; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX index_spree_return_authorization_reasons_on_name ON public.spree_return_authorization_reasons USING btree (name);


--
-- Name: index_spree_return_authorizations_on_number; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX index_spree_return_authorizations_on_number ON public.spree_return_authorizations USING btree (number);


--
-- Name: index_spree_return_authorizations_on_order_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX index_spree_return_authorizations_on_order_id ON public.spree_return_authorizations USING btree (order_id);


--
-- Name: index_spree_return_authorizations_on_stock_location_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX index_spree_return_authorizations_on_stock_location_id ON public.spree_return_authorizations USING btree (stock_location_id);


--
-- Name: index_spree_return_items_on_exchange_variant_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX index_spree_return_items_on_exchange_variant_id ON public.spree_return_items USING btree (exchange_variant_id);


--
-- Name: index_spree_return_items_on_inventory_unit_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX index_spree_return_items_on_inventory_unit_id ON public.spree_return_items USING btree (inventory_unit_id);


--
-- Name: index_spree_return_items_on_override_reimbursement_type_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX index_spree_return_items_on_override_reimbursement_type_id ON public.spree_return_items USING btree (override_reimbursement_type_id);


--
-- Name: index_spree_return_items_on_preferred_reimbursement_type_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX index_spree_return_items_on_preferred_reimbursement_type_id ON public.spree_return_items USING btree (preferred_reimbursement_type_id);


--
-- Name: index_spree_return_items_on_reimbursement_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX index_spree_return_items_on_reimbursement_id ON public.spree_return_items USING btree (reimbursement_id);


--
-- Name: index_spree_return_items_on_return_authorization_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX index_spree_return_items_on_return_authorization_id ON public.spree_return_items USING btree (return_authorization_id);


--
-- Name: index_spree_role_users_on_role_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX index_spree_role_users_on_role_id ON public.spree_role_users USING btree (role_id);


--
-- Name: index_spree_role_users_on_user_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX index_spree_role_users_on_user_id ON public.spree_role_users USING btree (user_id);


--
-- Name: index_spree_roles_on_name; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX index_spree_roles_on_name ON public.spree_roles USING btree (name);


--
-- Name: index_spree_shipments_on_address_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX index_spree_shipments_on_address_id ON public.spree_shipments USING btree (address_id);


--
-- Name: index_spree_shipments_on_number; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX index_spree_shipments_on_number ON public.spree_shipments USING btree (number);


--
-- Name: index_spree_shipments_on_order_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX index_spree_shipments_on_order_id ON public.spree_shipments USING btree (order_id);


--
-- Name: index_spree_shipments_on_stock_location_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX index_spree_shipments_on_stock_location_id ON public.spree_shipments USING btree (stock_location_id);


--
-- Name: index_spree_shipping_categories_on_name; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX index_spree_shipping_categories_on_name ON public.spree_shipping_categories USING btree (name);


--
-- Name: index_spree_shipping_method_categories_on_shipping_category_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX index_spree_shipping_method_categories_on_shipping_category_id ON public.spree_shipping_method_categories USING btree (shipping_category_id);


--
-- Name: index_spree_shipping_method_categories_on_shipping_method_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX index_spree_shipping_method_categories_on_shipping_method_id ON public.spree_shipping_method_categories USING btree (shipping_method_id);


--
-- Name: index_spree_shipping_method_zones_on_shipping_method_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX index_spree_shipping_method_zones_on_shipping_method_id ON public.spree_shipping_method_zones USING btree (shipping_method_id);


--
-- Name: index_spree_shipping_method_zones_on_zone_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX index_spree_shipping_method_zones_on_zone_id ON public.spree_shipping_method_zones USING btree (zone_id);


--
-- Name: index_spree_shipping_methods_on_deleted_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX index_spree_shipping_methods_on_deleted_at ON public.spree_shipping_methods USING btree (deleted_at);


--
-- Name: index_spree_shipping_methods_on_tax_category_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX index_spree_shipping_methods_on_tax_category_id ON public.spree_shipping_methods USING btree (tax_category_id);


--
-- Name: index_spree_shipping_rates_on_selected; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX index_spree_shipping_rates_on_selected ON public.spree_shipping_rates USING btree (selected);


--
-- Name: index_spree_shipping_rates_on_shipment_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX index_spree_shipping_rates_on_shipment_id ON public.spree_shipping_rates USING btree (shipment_id);


--
-- Name: index_spree_shipping_rates_on_shipping_method_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX index_spree_shipping_rates_on_shipping_method_id ON public.spree_shipping_rates USING btree (shipping_method_id);


--
-- Name: index_spree_shipping_rates_on_tax_rate_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX index_spree_shipping_rates_on_tax_rate_id ON public.spree_shipping_rates USING btree (tax_rate_id);


--
-- Name: index_spree_state_changes_on_stateful_id_and_stateful_type; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX index_spree_state_changes_on_stateful_id_and_stateful_type ON public.spree_state_changes USING btree (stateful_id, stateful_type);


--
-- Name: index_spree_states_on_country_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX index_spree_states_on_country_id ON public.spree_states USING btree (country_id);


--
-- Name: index_spree_stock_items_on_backorderable; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX index_spree_stock_items_on_backorderable ON public.spree_stock_items USING btree (backorderable);


--
-- Name: index_spree_stock_items_on_deleted_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX index_spree_stock_items_on_deleted_at ON public.spree_stock_items USING btree (deleted_at);


--
-- Name: index_spree_stock_items_on_stock_location_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX index_spree_stock_items_on_stock_location_id ON public.spree_stock_items USING btree (stock_location_id);


--
-- Name: index_spree_stock_items_on_variant_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX index_spree_stock_items_on_variant_id ON public.spree_stock_items USING btree (variant_id);


--
-- Name: index_spree_stock_locations_on_active; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX index_spree_stock_locations_on_active ON public.spree_stock_locations USING btree (active);


--
-- Name: index_spree_stock_locations_on_backorderable_default; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX index_spree_stock_locations_on_backorderable_default ON public.spree_stock_locations USING btree (backorderable_default);


--
-- Name: index_spree_stock_locations_on_country_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX index_spree_stock_locations_on_country_id ON public.spree_stock_locations USING btree (country_id);


--
-- Name: index_spree_stock_locations_on_propagate_all_variants; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX index_spree_stock_locations_on_propagate_all_variants ON public.spree_stock_locations USING btree (propagate_all_variants);


--
-- Name: index_spree_stock_locations_on_state_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX index_spree_stock_locations_on_state_id ON public.spree_stock_locations USING btree (state_id);


--
-- Name: index_spree_stock_movements_on_stock_item_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX index_spree_stock_movements_on_stock_item_id ON public.spree_stock_movements USING btree (stock_item_id);


--
-- Name: index_spree_stock_transfers_on_destination_location_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX index_spree_stock_transfers_on_destination_location_id ON public.spree_stock_transfers USING btree (destination_location_id);


--
-- Name: index_spree_stock_transfers_on_number; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX index_spree_stock_transfers_on_number ON public.spree_stock_transfers USING btree (number);


--
-- Name: index_spree_stock_transfers_on_source_location_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX index_spree_stock_transfers_on_source_location_id ON public.spree_stock_transfers USING btree (source_location_id);


--
-- Name: index_spree_store_credit_events_on_store_credit_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX index_spree_store_credit_events_on_store_credit_id ON public.spree_store_credit_events USING btree (store_credit_id);


--
-- Name: index_spree_store_credit_types_on_priority; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX index_spree_store_credit_types_on_priority ON public.spree_store_credit_types USING btree (priority);


--
-- Name: index_spree_store_credits_on_deleted_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX index_spree_store_credits_on_deleted_at ON public.spree_store_credits USING btree (deleted_at);


--
-- Name: index_spree_store_credits_on_store_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX index_spree_store_credits_on_store_id ON public.spree_store_credits USING btree (store_id);


--
-- Name: index_spree_store_credits_on_type_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX index_spree_store_credits_on_type_id ON public.spree_store_credits USING btree (type_id);


--
-- Name: index_spree_store_credits_on_user_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX index_spree_store_credits_on_user_id ON public.spree_store_credits USING btree (user_id);


--
-- Name: index_spree_stores_on_code; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX index_spree_stores_on_code ON public.spree_stores USING btree (code);


--
-- Name: index_spree_stores_on_default; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX index_spree_stores_on_default ON public.spree_stores USING btree ("default");


--
-- Name: index_spree_stores_on_deleted_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX index_spree_stores_on_deleted_at ON public.spree_stores USING btree (deleted_at);


--
-- Name: index_spree_stores_on_url; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX index_spree_stores_on_url ON public.spree_stores USING btree (url);


--
-- Name: index_spree_tax_categories_on_deleted_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX index_spree_tax_categories_on_deleted_at ON public.spree_tax_categories USING btree (deleted_at);


--
-- Name: index_spree_tax_categories_on_is_default; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX index_spree_tax_categories_on_is_default ON public.spree_tax_categories USING btree (is_default);


--
-- Name: index_spree_tax_rates_on_deleted_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX index_spree_tax_rates_on_deleted_at ON public.spree_tax_rates USING btree (deleted_at);


--
-- Name: index_spree_tax_rates_on_included_in_price; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX index_spree_tax_rates_on_included_in_price ON public.spree_tax_rates USING btree (included_in_price);


--
-- Name: index_spree_tax_rates_on_show_rate_in_label; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX index_spree_tax_rates_on_show_rate_in_label ON public.spree_tax_rates USING btree (show_rate_in_label);


--
-- Name: index_spree_tax_rates_on_tax_category_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX index_spree_tax_rates_on_tax_category_id ON public.spree_tax_rates USING btree (tax_category_id);


--
-- Name: index_spree_tax_rates_on_zone_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX index_spree_tax_rates_on_zone_id ON public.spree_tax_rates USING btree (zone_id);


--
-- Name: index_spree_taxonomies_on_name_and_store_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX index_spree_taxonomies_on_name_and_store_id ON public.spree_taxonomies USING btree (name, store_id);


--
-- Name: index_spree_taxonomies_on_position; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX index_spree_taxonomies_on_position ON public.spree_taxonomies USING btree ("position");


--
-- Name: index_spree_taxonomies_on_store_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX index_spree_taxonomies_on_store_id ON public.spree_taxonomies USING btree (store_id);


--
-- Name: index_spree_taxons_on_lft; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX index_spree_taxons_on_lft ON public.spree_taxons USING btree (lft);


--
-- Name: index_spree_taxons_on_name; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX index_spree_taxons_on_name ON public.spree_taxons USING btree (name);


--
-- Name: index_spree_taxons_on_name_and_parent_id_and_taxonomy_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX index_spree_taxons_on_name_and_parent_id_and_taxonomy_id ON public.spree_taxons USING btree (name, parent_id, taxonomy_id);


--
-- Name: index_spree_taxons_on_permalink_and_parent_id_and_taxonomy_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX index_spree_taxons_on_permalink_and_parent_id_and_taxonomy_id ON public.spree_taxons USING btree (permalink, parent_id, taxonomy_id);


--
-- Name: index_spree_taxons_on_position; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX index_spree_taxons_on_position ON public.spree_taxons USING btree ("position");


--
-- Name: index_spree_taxons_on_rgt; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX index_spree_taxons_on_rgt ON public.spree_taxons USING btree (rgt);


--
-- Name: index_spree_trackers_on_active; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX index_spree_trackers_on_active ON public.spree_trackers USING btree (active);


--
-- Name: index_spree_users_on_bill_address_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX index_spree_users_on_bill_address_id ON public.spree_users USING btree (bill_address_id);


--
-- Name: index_spree_users_on_deleted_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX index_spree_users_on_deleted_at ON public.spree_users USING btree (deleted_at);


--
-- Name: index_spree_users_on_ship_address_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX index_spree_users_on_ship_address_id ON public.spree_users USING btree (ship_address_id);


--
-- Name: index_spree_users_on_spree_api_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX index_spree_users_on_spree_api_key ON public.spree_users USING btree (spree_api_key);


--
-- Name: index_spree_variants_on_deleted_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX index_spree_variants_on_deleted_at ON public.spree_variants USING btree (deleted_at);


--
-- Name: index_spree_variants_on_discontinue_on; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX index_spree_variants_on_discontinue_on ON public.spree_variants USING btree (discontinue_on);


--
-- Name: index_spree_variants_on_is_master; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX index_spree_variants_on_is_master ON public.spree_variants USING btree (is_master);


--
-- Name: index_spree_variants_on_position; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX index_spree_variants_on_position ON public.spree_variants USING btree ("position");


--
-- Name: index_spree_variants_on_product_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX index_spree_variants_on_product_id ON public.spree_variants USING btree (product_id);


--
-- Name: index_spree_variants_on_sku; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX index_spree_variants_on_sku ON public.spree_variants USING btree (sku);


--
-- Name: index_spree_variants_on_tax_category_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX index_spree_variants_on_tax_category_id ON public.spree_variants USING btree (tax_category_id);


--
-- Name: index_spree_variants_on_track_inventory; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX index_spree_variants_on_track_inventory ON public.spree_variants USING btree (track_inventory);


--
-- Name: index_spree_webhooks_events_on_response_code; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX index_spree_webhooks_events_on_response_code ON public.spree_webhooks_events USING btree (response_code);


--
-- Name: index_spree_webhooks_events_on_subscriber_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX index_spree_webhooks_events_on_subscriber_id ON public.spree_webhooks_events USING btree (subscriber_id);


--
-- Name: index_spree_webhooks_events_on_success; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX index_spree_webhooks_events_on_success ON public.spree_webhooks_events USING btree (success);


--
-- Name: index_spree_webhooks_subscribers_on_active; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX index_spree_webhooks_subscribers_on_active ON public.spree_webhooks_subscribers USING btree (active);


--
-- Name: index_spree_wished_items_on_variant_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX index_spree_wished_items_on_variant_id ON public.spree_wished_items USING btree (variant_id);


--
-- Name: index_spree_wished_items_on_variant_id_and_wishlist_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX index_spree_wished_items_on_variant_id_and_wishlist_id ON public.spree_wished_items USING btree (variant_id, wishlist_id);


--
-- Name: index_spree_wished_items_on_wishlist_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX index_spree_wished_items_on_wishlist_id ON public.spree_wished_items USING btree (wishlist_id);


--
-- Name: index_spree_wishlists_on_store_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX index_spree_wishlists_on_store_id ON public.spree_wishlists USING btree (store_id);


--
-- Name: index_spree_wishlists_on_token; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX index_spree_wishlists_on_token ON public.spree_wishlists USING btree (token);


--
-- Name: index_spree_wishlists_on_user_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX index_spree_wishlists_on_user_id ON public.spree_wishlists USING btree (user_id);


--
-- Name: index_spree_wishlists_on_user_id_and_is_default; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX index_spree_wishlists_on_user_id_and_is_default ON public.spree_wishlists USING btree (user_id, is_default);


--
-- Name: index_spree_zone_members_on_zone_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX index_spree_zone_members_on_zone_id ON public.spree_zone_members USING btree (zone_id);


--
-- Name: index_spree_zone_members_on_zoneable_id_and_zoneable_type; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX index_spree_zone_members_on_zoneable_id_and_zoneable_type ON public.spree_zone_members USING btree (zoneable_id, zoneable_type);


--
-- Name: index_spree_zones_on_default_tax; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX index_spree_zones_on_default_tax ON public.spree_zones USING btree (default_tax);


--
-- Name: index_spree_zones_on_kind; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX index_spree_zones_on_kind ON public.spree_zones USING btree (kind);


--
-- Name: index_stock_movements_on_originator_id_and_originator_type; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX index_stock_movements_on_originator_id_and_originator_type ON public.spree_stock_movements USING btree (originator_id, originator_type);


--
-- Name: index_taxons_on_parent_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX index_taxons_on_parent_id ON public.spree_taxons USING btree (parent_id);


--
-- Name: index_taxons_on_permalink; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX index_taxons_on_permalink ON public.spree_taxons USING btree (permalink);


--
-- Name: index_taxons_on_taxonomy_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX index_taxons_on_taxonomy_id ON public.spree_taxons USING btree (taxonomy_id);


--
-- Name: payment_mentod_id_store_id_unique_index; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX payment_mentod_id_store_id_unique_index ON public.spree_payment_methods_stores USING btree (payment_method_id, store_id);


--
-- Name: polymorphic_owner_oauth_access_grants; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX polymorphic_owner_oauth_access_grants ON public.spree_oauth_access_grants USING btree (resource_owner_id, resource_owner_type);


--
-- Name: polymorphic_owner_oauth_access_tokens; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX polymorphic_owner_oauth_access_tokens ON public.spree_oauth_access_tokens USING btree (resource_owner_id, resource_owner_type);


--
-- Name: spree_option_type_prototypes_prototype_id_option_type_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX spree_option_type_prototypes_prototype_id_option_type_id ON public.spree_option_type_prototypes USING btree (prototype_id, option_type_id);


--
-- Name: spree_shipping_rates_join_index; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX spree_shipping_rates_join_index ON public.spree_shipping_rates USING btree (shipment_id, shipping_method_id);


--
-- Name: spree_store_credit_events_originator; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX spree_store_credit_events_originator ON public.spree_store_credit_events USING btree (originator_id, originator_type);


--
-- Name: spree_store_credits_originator; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX spree_store_credits_originator ON public.spree_store_credits USING btree (originator_id, originator_type);


--
-- Name: stock_item_by_loc_and_var_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX stock_item_by_loc_and_var_id ON public.spree_stock_items USING btree (stock_location_id, variant_id);


--
-- Name: stock_item_by_loc_var_id_deleted_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX stock_item_by_loc_var_id_deleted_at ON public.spree_stock_items USING btree (stock_location_id, variant_id, COALESCE(deleted_at, '1970-01-01 00:00:00'::timestamp without time zone));


--
-- Name: unique_spree_shipping_method_categories; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX unique_spree_shipping_method_categories ON public.spree_shipping_method_categories USING btree (shipping_category_id, shipping_method_id);


--
-- Name: spree_oauth_access_grants fk_rails_8049be136c; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.spree_oauth_access_grants
    ADD CONSTRAINT fk_rails_8049be136c FOREIGN KEY (application_id) REFERENCES public.spree_oauth_applications(id);


--
-- Name: active_storage_variant_records fk_rails_993965df05; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.active_storage_variant_records
    ADD CONSTRAINT fk_rails_993965df05 FOREIGN KEY (blob_id) REFERENCES public.active_storage_blobs(id);


--
-- Name: active_storage_attachments fk_rails_c3b3935057; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.active_storage_attachments
    ADD CONSTRAINT fk_rails_c3b3935057 FOREIGN KEY (blob_id) REFERENCES public.active_storage_blobs(id);


--
-- Name: spree_oauth_access_tokens fk_rails_c9894c7021; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.spree_oauth_access_tokens
    ADD CONSTRAINT fk_rails_c9894c7021 FOREIGN KEY (application_id) REFERENCES public.spree_oauth_applications(id);


--
-- PostgreSQL database dump complete
--

--
-- Database "spree_starter_test" dump
--

--
-- PostgreSQL database dump
--

-- Dumped from database version 13.7
-- Dumped by pg_dump version 13.7

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: spree_starter_test; Type: DATABASE; Schema: -; Owner: postgres
--

CREATE DATABASE spree_starter_test WITH TEMPLATE = template0 ENCODING = 'UTF8' LOCALE = 'en_US.utf8';


ALTER DATABASE spree_starter_test OWNER TO postgres;

\connect spree_starter_test

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- PostgreSQL database dump complete
--

--
-- PostgreSQL database cluster dump complete
--

