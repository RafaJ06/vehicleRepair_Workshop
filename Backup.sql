--
-- PostgreSQL database dump
--

\restrict CBgJUXI0b0dqQ57F2oLxZFYHHs7eY9e3hIqwHznfIMj2TR4XYZHS0BeIFaeKFIx

-- Dumped from database version 18.4
-- Dumped by pg_dump version 18.4

-- Started on 2026-07-06 17:39:46

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
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
-- TOC entry 237 (class 1259 OID 16532)
-- Name: asignacion_mecanicos_diagnostico; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.asignacion_mecanicos_diagnostico (
    id_asignacion integer NOT NULL,
    id_diagnostico integer,
    id_mecanico integer,
    fecha_asignacion timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    estado boolean DEFAULT true
);


ALTER TABLE public.asignacion_mecanicos_diagnostico OWNER TO postgres;

--
-- TOC entry 236 (class 1259 OID 16531)
-- Name: asignacion_mecanicos_diagnostico_id_asignacion_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.asignacion_mecanicos_diagnostico_id_asignacion_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.asignacion_mecanicos_diagnostico_id_asignacion_seq OWNER TO postgres;

--
-- TOC entry 5231 (class 0 OID 0)
-- Dependencies: 236
-- Name: asignacion_mecanicos_diagnostico_id_asignacion_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.asignacion_mecanicos_diagnostico_id_asignacion_seq OWNED BY public.asignacion_mecanicos_diagnostico.id_asignacion;


--
-- TOC entry 230 (class 1259 OID 16459)
-- Name: clientes; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.clientes (
    id_cliente integer NOT NULL,
    id_tipo_identificacion integer,
    identificacion character varying(20) NOT NULL,
    nombre character varying(100) NOT NULL,
    telefono character varying(20),
    direccion text,
    email character varying(100),
    fecha_creacion timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    estado boolean DEFAULT true
);


ALTER TABLE public.clientes OWNER TO postgres;

--
-- TOC entry 229 (class 1259 OID 16458)
-- Name: clientes_id_cliente_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.clientes_id_cliente_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.clientes_id_cliente_seq OWNER TO postgres;

--
-- TOC entry 5232 (class 0 OID 0)
-- Dependencies: 229
-- Name: clientes_id_cliente_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.clientes_id_cliente_seq OWNED BY public.clientes.id_cliente;


--
-- TOC entry 233 (class 1259 OID 16495)
-- Name: clientes_vehiculos; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.clientes_vehiculos (
    id_cliente integer NOT NULL,
    id_vehiculo integer NOT NULL
);


ALTER TABLE public.clientes_vehiculos OWNER TO postgres;

--
-- TOC entry 246 (class 1259 OID 16642)
-- Name: cuentas_por_cobrar; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.cuentas_por_cobrar (
    id_cxc integer NOT NULL,
    id_factura integer,
    monto_total numeric(10,2) NOT NULL,
    monto_pagado numeric(10,2) DEFAULT 0.00,
    monto_pendiente numeric(10,2) NOT NULL,
    estatus character varying(20) DEFAULT 'Vigente'::character varying,
    estado boolean DEFAULT true
);


ALTER TABLE public.cuentas_por_cobrar OWNER TO postgres;

--
-- TOC entry 245 (class 1259 OID 16641)
-- Name: cuentas_por_cobrar_id_cxc_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.cuentas_por_cobrar_id_cxc_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.cuentas_por_cobrar_id_cxc_seq OWNER TO postgres;

--
-- TOC entry 5233 (class 0 OID 0)
-- Dependencies: 245
-- Name: cuentas_por_cobrar_id_cxc_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.cuentas_por_cobrar_id_cxc_seq OWNED BY public.cuentas_por_cobrar.id_cxc;


--
-- TOC entry 235 (class 1259 OID 16513)
-- Name: diagnosticos; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.diagnosticos (
    id_diagnostico integer NOT NULL,
    id_vehiculo integer,
    presion_baja numeric(5,2),
    presion_alta numeric(5,2),
    temperatura numeric(5,2),
    falla_detectada text NOT NULL,
    fecha timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    estatus character varying(20) DEFAULT 'Pendiente'::character varying,
    estado boolean DEFAULT true
);


ALTER TABLE public.diagnosticos OWNER TO postgres;

--
-- TOC entry 234 (class 1259 OID 16512)
-- Name: diagnosticos_id_diagnostico_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.diagnosticos_id_diagnostico_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.diagnosticos_id_diagnostico_seq OWNER TO postgres;

--
-- TOC entry 5234 (class 0 OID 0)
-- Dependencies: 234
-- Name: diagnosticos_id_diagnostico_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.diagnosticos_id_diagnostico_seq OWNED BY public.diagnosticos.id_diagnostico;


--
-- TOC entry 243 (class 1259 OID 16602)
-- Name: factura_detalles; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.factura_detalles (
    id_detalle integer NOT NULL,
    id_factura integer,
    id_material integer,
    cantidad integer NOT NULL,
    precio_unitario numeric(10,2) NOT NULL,
    valor_impuesto numeric(10,2) NOT NULL,
    subtotal_item numeric(10,2) NOT NULL,
    estado boolean DEFAULT true
);


ALTER TABLE public.factura_detalles OWNER TO postgres;

--
-- TOC entry 242 (class 1259 OID 16601)
-- Name: factura_detalles_id_detalle_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.factura_detalles_id_detalle_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.factura_detalles_id_detalle_seq OWNER TO postgres;

--
-- TOC entry 5235 (class 0 OID 0)
-- Dependencies: 242
-- Name: factura_detalles_id_detalle_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.factura_detalles_id_detalle_seq OWNED BY public.factura_detalles.id_detalle;


--
-- TOC entry 244 (class 1259 OID 16624)
-- Name: factura_diagnostico_puente; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.factura_diagnostico_puente (
    id_factura integer NOT NULL,
    id_diagnostico integer NOT NULL
);


ALTER TABLE public.factura_diagnostico_puente OWNER TO postgres;

--
-- TOC entry 241 (class 1259 OID 16573)
-- Name: facturas; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.facturas (
    id_factura integer NOT NULL,
    id_ot integer,
    id_cliente integer,
    fecha timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    subtotal numeric(10,2) DEFAULT 0.00 NOT NULL,
    total_impuestos numeric(10,2) DEFAULT 0.00 NOT NULL,
    total numeric(10,2) DEFAULT 0.00 NOT NULL,
    estatus character varying(20) DEFAULT 'Pendiente'::character varying,
    estado boolean DEFAULT true
);


ALTER TABLE public.facturas OWNER TO postgres;

--
-- TOC entry 240 (class 1259 OID 16572)
-- Name: facturas_id_factura_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.facturas_id_factura_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.facturas_id_factura_seq OWNER TO postgres;

--
-- TOC entry 5236 (class 0 OID 0)
-- Dependencies: 240
-- Name: facturas_id_factura_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.facturas_id_factura_seq OWNED BY public.facturas.id_factura;


--
-- TOC entry 256 (class 1259 OID 16727)
-- Name: favorites; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.favorites (
    id integer NOT NULL,
    user_id integer,
    movie_id integer,
    added_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.favorites OWNER TO postgres;

--
-- TOC entry 255 (class 1259 OID 16726)
-- Name: favorites_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.favorites_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.favorites_id_seq OWNER TO postgres;

--
-- TOC entry 5237 (class 0 OID 0)
-- Dependencies: 255
-- Name: favorites_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.favorites_id_seq OWNED BY public.favorites.id;


--
-- TOC entry 226 (class 1259 OID 16429)
-- Name: impuestos; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.impuestos (
    id_impuesto integer NOT NULL,
    nombre character varying(50) NOT NULL,
    porcentaje numeric(5,2) NOT NULL,
    estado boolean DEFAULT true
);


ALTER TABLE public.impuestos OWNER TO postgres;

--
-- TOC entry 225 (class 1259 OID 16428)
-- Name: impuestos_id_impuesto_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.impuestos_id_impuesto_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.impuestos_id_impuesto_seq OWNER TO postgres;

--
-- TOC entry 5238 (class 0 OID 0)
-- Dependencies: 225
-- Name: impuestos_id_impuesto_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.impuestos_id_impuesto_seq OWNED BY public.impuestos.id_impuesto;


--
-- TOC entry 228 (class 1259 OID 16440)
-- Name: materiales_repuestos; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.materiales_repuestos (
    id_material integer NOT NULL,
    nombre character varying(100) NOT NULL,
    precio_unitario numeric(10,2) NOT NULL,
    id_impuesto integer,
    stock integer DEFAULT 0 NOT NULL,
    estatus character varying(20) DEFAULT 'Disponible'::character varying,
    estado boolean DEFAULT true
);


ALTER TABLE public.materiales_repuestos OWNER TO postgres;

--
-- TOC entry 227 (class 1259 OID 16439)
-- Name: materiales_repuestos_id_material_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.materiales_repuestos_id_material_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.materiales_repuestos_id_material_seq OWNER TO postgres;

--
-- TOC entry 5239 (class 0 OID 0)
-- Dependencies: 227
-- Name: materiales_repuestos_id_material_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.materiales_repuestos_id_material_seq OWNED BY public.materiales_repuestos.id_material;


--
-- TOC entry 252 (class 1259 OID 16699)
-- Name: movies; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.movies (
    id integer NOT NULL,
    title character varying(255) NOT NULL,
    description text,
    release_year integer,
    duration integer,
    genre character varying(100),
    poster_url character varying(500),
    video_url character varying(500),
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.movies OWNER TO postgres;

--
-- TOC entry 251 (class 1259 OID 16698)
-- Name: movies_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.movies_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.movies_id_seq OWNER TO postgres;

--
-- TOC entry 5240 (class 0 OID 0)
-- Dependencies: 251
-- Name: movies_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.movies_id_seq OWNED BY public.movies.id;


--
-- TOC entry 239 (class 1259 OID 16552)
-- Name: ordenes_trabajo; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.ordenes_trabajo (
    id_ot integer NOT NULL,
    id_diagnostico integer,
    id_mecanico integer,
    fecha_creacion timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    fecha_cierre timestamp without time zone,
    estatus character varying(20) DEFAULT 'En Proceso'::character varying,
    estado boolean DEFAULT true
);


ALTER TABLE public.ordenes_trabajo OWNER TO postgres;

--
-- TOC entry 238 (class 1259 OID 16551)
-- Name: ordenes_trabajo_id_ot_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.ordenes_trabajo_id_ot_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.ordenes_trabajo_id_ot_seq OWNER TO postgres;

--
-- TOC entry 5241 (class 0 OID 0)
-- Dependencies: 238
-- Name: ordenes_trabajo_id_ot_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.ordenes_trabajo_id_ot_seq OWNED BY public.ordenes_trabajo.id_ot;


--
-- TOC entry 250 (class 1259 OID 16677)
-- Name: pagos_detalle; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.pagos_detalle (
    id_pago_detalle integer NOT NULL,
    id_pago_maestro integer,
    id_cxc integer,
    monto_abonado numeric(10,2) NOT NULL,
    estado boolean DEFAULT true
);


ALTER TABLE public.pagos_detalle OWNER TO postgres;

--
-- TOC entry 249 (class 1259 OID 16676)
-- Name: pagos_detalle_id_pago_detalle_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.pagos_detalle_id_pago_detalle_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.pagos_detalle_id_pago_detalle_seq OWNER TO postgres;

--
-- TOC entry 5242 (class 0 OID 0)
-- Dependencies: 249
-- Name: pagos_detalle_id_pago_detalle_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.pagos_detalle_id_pago_detalle_seq OWNED BY public.pagos_detalle.id_pago_detalle;


--
-- TOC entry 248 (class 1259 OID 16660)
-- Name: pagos_maestro; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.pagos_maestro (
    id_pago_maestro integer NOT NULL,
    id_cliente integer,
    fecha_pago timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    forma_pago character varying(50) NOT NULL,
    monto_total_recibido numeric(10,2) NOT NULL,
    estado boolean DEFAULT true
);


ALTER TABLE public.pagos_maestro OWNER TO postgres;

--
-- TOC entry 247 (class 1259 OID 16659)
-- Name: pagos_maestro_id_pago_maestro_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.pagos_maestro_id_pago_maestro_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.pagos_maestro_id_pago_maestro_seq OWNER TO postgres;

--
-- TOC entry 5243 (class 0 OID 0)
-- Dependencies: 247
-- Name: pagos_maestro_id_pago_maestro_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.pagos_maestro_id_pago_maestro_seq OWNED BY public.pagos_maestro.id_pago_maestro;


--
-- TOC entry 222 (class 1259 OID 16400)
-- Name: roles; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.roles (
    id_rol integer NOT NULL,
    nombre character varying(50) NOT NULL,
    estado boolean DEFAULT true
);


ALTER TABLE public.roles OWNER TO postgres;

--
-- TOC entry 221 (class 1259 OID 16399)
-- Name: roles_id_rol_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.roles_id_rol_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.roles_id_rol_seq OWNER TO postgres;

--
-- TOC entry 5244 (class 0 OID 0)
-- Dependencies: 221
-- Name: roles_id_rol_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.roles_id_rol_seq OWNED BY public.roles.id_rol;


--
-- TOC entry 220 (class 1259 OID 16390)
-- Name: tipo_identificacion; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.tipo_identificacion (
    id_tipo_identificacion integer NOT NULL,
    nombre character varying(50) NOT NULL,
    estado boolean DEFAULT true
);


ALTER TABLE public.tipo_identificacion OWNER TO postgres;

--
-- TOC entry 219 (class 1259 OID 16389)
-- Name: tipo_identificacion_id_tipo_identificacion_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.tipo_identificacion_id_tipo_identificacion_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.tipo_identificacion_id_tipo_identificacion_seq OWNER TO postgres;

--
-- TOC entry 5245 (class 0 OID 0)
-- Dependencies: 219
-- Name: tipo_identificacion_id_tipo_identificacion_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.tipo_identificacion_id_tipo_identificacion_seq OWNED BY public.tipo_identificacion.id_tipo_identificacion;


--
-- TOC entry 254 (class 1259 OID 16711)
-- Name: users; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.users (
    id integer NOT NULL,
    username character varying(50) NOT NULL,
    email character varying(100) NOT NULL,
    password_hash character varying(255) NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.users OWNER TO postgres;

--
-- TOC entry 253 (class 1259 OID 16710)
-- Name: users_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.users_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.users_id_seq OWNER TO postgres;

--
-- TOC entry 5246 (class 0 OID 0)
-- Dependencies: 253
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;


--
-- TOC entry 224 (class 1259 OID 16410)
-- Name: usuarios; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.usuarios (
    id_usuario integer NOT NULL,
    id_rol integer,
    nombre character varying(100) NOT NULL,
    email character varying(100) NOT NULL,
    contrasena_hash character varying(255) NOT NULL,
    estado boolean DEFAULT true
);


ALTER TABLE public.usuarios OWNER TO postgres;

--
-- TOC entry 223 (class 1259 OID 16409)
-- Name: usuarios_id_usuario_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.usuarios_id_usuario_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.usuarios_id_usuario_seq OWNER TO postgres;

--
-- TOC entry 5247 (class 0 OID 0)
-- Dependencies: 223
-- Name: usuarios_id_usuario_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.usuarios_id_usuario_seq OWNED BY public.usuarios.id_usuario;


--
-- TOC entry 232 (class 1259 OID 16480)
-- Name: vehiculos; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.vehiculos (
    id_vehiculo integer NOT NULL,
    chasis character varying(50) NOT NULL,
    marca character varying(50) NOT NULL,
    modelo character varying(50) NOT NULL,
    color character varying(30),
    anio integer,
    placa character varying(20),
    estado boolean DEFAULT true
);


ALTER TABLE public.vehiculos OWNER TO postgres;

--
-- TOC entry 231 (class 1259 OID 16479)
-- Name: vehiculos_id_vehiculo_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.vehiculos_id_vehiculo_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.vehiculos_id_vehiculo_seq OWNER TO postgres;

--
-- TOC entry 5248 (class 0 OID 0)
-- Dependencies: 231
-- Name: vehiculos_id_vehiculo_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.vehiculos_id_vehiculo_seq OWNED BY public.vehiculos.id_vehiculo;


--
-- TOC entry 4970 (class 2604 OID 16535)
-- Name: asignacion_mecanicos_diagnostico id_asignacion; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.asignacion_mecanicos_diagnostico ALTER COLUMN id_asignacion SET DEFAULT nextval('public.asignacion_mecanicos_diagnostico_id_asignacion_seq'::regclass);


--
-- TOC entry 4961 (class 2604 OID 16462)
-- Name: clientes id_cliente; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.clientes ALTER COLUMN id_cliente SET DEFAULT nextval('public.clientes_id_cliente_seq'::regclass);


--
-- TOC entry 4986 (class 2604 OID 16645)
-- Name: cuentas_por_cobrar id_cxc; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cuentas_por_cobrar ALTER COLUMN id_cxc SET DEFAULT nextval('public.cuentas_por_cobrar_id_cxc_seq'::regclass);


--
-- TOC entry 4966 (class 2604 OID 16516)
-- Name: diagnosticos id_diagnostico; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.diagnosticos ALTER COLUMN id_diagnostico SET DEFAULT nextval('public.diagnosticos_id_diagnostico_seq'::regclass);


--
-- TOC entry 4984 (class 2604 OID 16605)
-- Name: factura_detalles id_detalle; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.factura_detalles ALTER COLUMN id_detalle SET DEFAULT nextval('public.factura_detalles_id_detalle_seq'::regclass);


--
-- TOC entry 4977 (class 2604 OID 16576)
-- Name: facturas id_factura; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.facturas ALTER COLUMN id_factura SET DEFAULT nextval('public.facturas_id_factura_seq'::regclass);


--
-- TOC entry 4999 (class 2604 OID 16730)
-- Name: favorites id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.favorites ALTER COLUMN id SET DEFAULT nextval('public.favorites_id_seq'::regclass);


--
-- TOC entry 4955 (class 2604 OID 16432)
-- Name: impuestos id_impuesto; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.impuestos ALTER COLUMN id_impuesto SET DEFAULT nextval('public.impuestos_id_impuesto_seq'::regclass);


--
-- TOC entry 4957 (class 2604 OID 16443)
-- Name: materiales_repuestos id_material; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.materiales_repuestos ALTER COLUMN id_material SET DEFAULT nextval('public.materiales_repuestos_id_material_seq'::regclass);


--
-- TOC entry 4995 (class 2604 OID 16702)
-- Name: movies id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.movies ALTER COLUMN id SET DEFAULT nextval('public.movies_id_seq'::regclass);


--
-- TOC entry 4973 (class 2604 OID 16555)
-- Name: ordenes_trabajo id_ot; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ordenes_trabajo ALTER COLUMN id_ot SET DEFAULT nextval('public.ordenes_trabajo_id_ot_seq'::regclass);


--
-- TOC entry 4993 (class 2604 OID 16680)
-- Name: pagos_detalle id_pago_detalle; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pagos_detalle ALTER COLUMN id_pago_detalle SET DEFAULT nextval('public.pagos_detalle_id_pago_detalle_seq'::regclass);


--
-- TOC entry 4990 (class 2604 OID 16663)
-- Name: pagos_maestro id_pago_maestro; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pagos_maestro ALTER COLUMN id_pago_maestro SET DEFAULT nextval('public.pagos_maestro_id_pago_maestro_seq'::regclass);


--
-- TOC entry 4951 (class 2604 OID 16403)
-- Name: roles id_rol; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.roles ALTER COLUMN id_rol SET DEFAULT nextval('public.roles_id_rol_seq'::regclass);


--
-- TOC entry 4949 (class 2604 OID 16393)
-- Name: tipo_identificacion id_tipo_identificacion; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tipo_identificacion ALTER COLUMN id_tipo_identificacion SET DEFAULT nextval('public.tipo_identificacion_id_tipo_identificacion_seq'::regclass);


--
-- TOC entry 4997 (class 2604 OID 16714)
-- Name: users id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);


--
-- TOC entry 4953 (class 2604 OID 16413)
-- Name: usuarios id_usuario; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.usuarios ALTER COLUMN id_usuario SET DEFAULT nextval('public.usuarios_id_usuario_seq'::regclass);


--
-- TOC entry 4964 (class 2604 OID 16483)
-- Name: vehiculos id_vehiculo; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.vehiculos ALTER COLUMN id_vehiculo SET DEFAULT nextval('public.vehiculos_id_vehiculo_seq'::regclass);


--
-- TOC entry 5028 (class 2606 OID 16540)
-- Name: asignacion_mecanicos_diagnostico asignacion_mecanicos_diagnostico_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.asignacion_mecanicos_diagnostico
    ADD CONSTRAINT asignacion_mecanicos_diagnostico_pkey PRIMARY KEY (id_asignacion);


--
-- TOC entry 5014 (class 2606 OID 16473)
-- Name: clientes clientes_identificacion_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.clientes
    ADD CONSTRAINT clientes_identificacion_key UNIQUE (identificacion);


--
-- TOC entry 5016 (class 2606 OID 16471)
-- Name: clientes clientes_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.clientes
    ADD CONSTRAINT clientes_pkey PRIMARY KEY (id_cliente);


--
-- TOC entry 5024 (class 2606 OID 16501)
-- Name: clientes_vehiculos clientes_vehiculos_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.clientes_vehiculos
    ADD CONSTRAINT clientes_vehiculos_pkey PRIMARY KEY (id_cliente, id_vehiculo);


--
-- TOC entry 5040 (class 2606 OID 16653)
-- Name: cuentas_por_cobrar cuentas_por_cobrar_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cuentas_por_cobrar
    ADD CONSTRAINT cuentas_por_cobrar_pkey PRIMARY KEY (id_cxc);


--
-- TOC entry 5026 (class 2606 OID 16525)
-- Name: diagnosticos diagnosticos_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.diagnosticos
    ADD CONSTRAINT diagnosticos_pkey PRIMARY KEY (id_diagnostico);


--
-- TOC entry 5036 (class 2606 OID 16613)
-- Name: factura_detalles factura_detalles_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.factura_detalles
    ADD CONSTRAINT factura_detalles_pkey PRIMARY KEY (id_detalle);


--
-- TOC entry 5038 (class 2606 OID 16630)
-- Name: factura_diagnostico_puente factura_diagnostico_puente_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.factura_diagnostico_puente
    ADD CONSTRAINT factura_diagnostico_puente_pkey PRIMARY KEY (id_factura, id_diagnostico);


--
-- TOC entry 5032 (class 2606 OID 16590)
-- Name: facturas facturas_id_ot_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.facturas
    ADD CONSTRAINT facturas_id_ot_key UNIQUE (id_ot);


--
-- TOC entry 5034 (class 2606 OID 16588)
-- Name: facturas facturas_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.facturas
    ADD CONSTRAINT facturas_pkey PRIMARY KEY (id_factura);


--
-- TOC entry 5054 (class 2606 OID 16734)
-- Name: favorites favorites_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.favorites
    ADD CONSTRAINT favorites_pkey PRIMARY KEY (id);


--
-- TOC entry 5010 (class 2606 OID 16438)
-- Name: impuestos impuestos_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.impuestos
    ADD CONSTRAINT impuestos_pkey PRIMARY KEY (id_impuesto);


--
-- TOC entry 5012 (class 2606 OID 16452)
-- Name: materiales_repuestos materiales_repuestos_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.materiales_repuestos
    ADD CONSTRAINT materiales_repuestos_pkey PRIMARY KEY (id_material);


--
-- TOC entry 5046 (class 2606 OID 16709)
-- Name: movies movies_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.movies
    ADD CONSTRAINT movies_pkey PRIMARY KEY (id);


--
-- TOC entry 5030 (class 2606 OID 16561)
-- Name: ordenes_trabajo ordenes_trabajo_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ordenes_trabajo
    ADD CONSTRAINT ordenes_trabajo_pkey PRIMARY KEY (id_ot);


--
-- TOC entry 5044 (class 2606 OID 16685)
-- Name: pagos_detalle pagos_detalle_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pagos_detalle
    ADD CONSTRAINT pagos_detalle_pkey PRIMARY KEY (id_pago_detalle);


--
-- TOC entry 5042 (class 2606 OID 16670)
-- Name: pagos_maestro pagos_maestro_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pagos_maestro
    ADD CONSTRAINT pagos_maestro_pkey PRIMARY KEY (id_pago_maestro);


--
-- TOC entry 5004 (class 2606 OID 16408)
-- Name: roles roles_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.roles
    ADD CONSTRAINT roles_pkey PRIMARY KEY (id_rol);


--
-- TOC entry 5002 (class 2606 OID 16398)
-- Name: tipo_identificacion tipo_identificacion_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tipo_identificacion
    ADD CONSTRAINT tipo_identificacion_pkey PRIMARY KEY (id_tipo_identificacion);


--
-- TOC entry 5056 (class 2606 OID 16736)
-- Name: favorites unique_user_movie; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.favorites
    ADD CONSTRAINT unique_user_movie UNIQUE (user_id, movie_id);


--
-- TOC entry 5048 (class 2606 OID 16725)
-- Name: users users_email_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key UNIQUE (email);


--
-- TOC entry 5050 (class 2606 OID 16721)
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- TOC entry 5052 (class 2606 OID 16723)
-- Name: users users_username_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_username_key UNIQUE (username);


--
-- TOC entry 5006 (class 2606 OID 16422)
-- Name: usuarios usuarios_email_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.usuarios
    ADD CONSTRAINT usuarios_email_key UNIQUE (email);


--
-- TOC entry 5008 (class 2606 OID 16420)
-- Name: usuarios usuarios_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.usuarios
    ADD CONSTRAINT usuarios_pkey PRIMARY KEY (id_usuario);


--
-- TOC entry 5018 (class 2606 OID 16492)
-- Name: vehiculos vehiculos_chasis_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.vehiculos
    ADD CONSTRAINT vehiculos_chasis_key UNIQUE (chasis);


--
-- TOC entry 5020 (class 2606 OID 16490)
-- Name: vehiculos vehiculos_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.vehiculos
    ADD CONSTRAINT vehiculos_pkey PRIMARY KEY (id_vehiculo);


--
-- TOC entry 5022 (class 2606 OID 16494)
-- Name: vehiculos vehiculos_placa_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.vehiculos
    ADD CONSTRAINT vehiculos_placa_key UNIQUE (placa);


--
-- TOC entry 5063 (class 2606 OID 16541)
-- Name: asignacion_mecanicos_diagnostico asignacion_mecanicos_diagnostico_id_diagnostico_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.asignacion_mecanicos_diagnostico
    ADD CONSTRAINT asignacion_mecanicos_diagnostico_id_diagnostico_fkey FOREIGN KEY (id_diagnostico) REFERENCES public.diagnosticos(id_diagnostico);


--
-- TOC entry 5064 (class 2606 OID 16546)
-- Name: asignacion_mecanicos_diagnostico asignacion_mecanicos_diagnostico_id_mecanico_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.asignacion_mecanicos_diagnostico
    ADD CONSTRAINT asignacion_mecanicos_diagnostico_id_mecanico_fkey FOREIGN KEY (id_mecanico) REFERENCES public.usuarios(id_usuario);


--
-- TOC entry 5059 (class 2606 OID 16474)
-- Name: clientes clientes_id_tipo_identificacion_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.clientes
    ADD CONSTRAINT clientes_id_tipo_identificacion_fkey FOREIGN KEY (id_tipo_identificacion) REFERENCES public.tipo_identificacion(id_tipo_identificacion);


--
-- TOC entry 5060 (class 2606 OID 16502)
-- Name: clientes_vehiculos clientes_vehiculos_id_cliente_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.clientes_vehiculos
    ADD CONSTRAINT clientes_vehiculos_id_cliente_fkey FOREIGN KEY (id_cliente) REFERENCES public.clientes(id_cliente);


--
-- TOC entry 5061 (class 2606 OID 16507)
-- Name: clientes_vehiculos clientes_vehiculos_id_vehiculo_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.clientes_vehiculos
    ADD CONSTRAINT clientes_vehiculos_id_vehiculo_fkey FOREIGN KEY (id_vehiculo) REFERENCES public.vehiculos(id_vehiculo);


--
-- TOC entry 5073 (class 2606 OID 16654)
-- Name: cuentas_por_cobrar cuentas_por_cobrar_id_factura_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cuentas_por_cobrar
    ADD CONSTRAINT cuentas_por_cobrar_id_factura_fkey FOREIGN KEY (id_factura) REFERENCES public.facturas(id_factura);


--
-- TOC entry 5062 (class 2606 OID 16526)
-- Name: diagnosticos diagnosticos_id_vehiculo_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.diagnosticos
    ADD CONSTRAINT diagnosticos_id_vehiculo_fkey FOREIGN KEY (id_vehiculo) REFERENCES public.vehiculos(id_vehiculo);


--
-- TOC entry 5069 (class 2606 OID 16614)
-- Name: factura_detalles factura_detalles_id_factura_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.factura_detalles
    ADD CONSTRAINT factura_detalles_id_factura_fkey FOREIGN KEY (id_factura) REFERENCES public.facturas(id_factura);


--
-- TOC entry 5070 (class 2606 OID 16619)
-- Name: factura_detalles factura_detalles_id_material_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.factura_detalles
    ADD CONSTRAINT factura_detalles_id_material_fkey FOREIGN KEY (id_material) REFERENCES public.materiales_repuestos(id_material);


--
-- TOC entry 5071 (class 2606 OID 16636)
-- Name: factura_diagnostico_puente factura_diagnostico_puente_id_diagnostico_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.factura_diagnostico_puente
    ADD CONSTRAINT factura_diagnostico_puente_id_diagnostico_fkey FOREIGN KEY (id_diagnostico) REFERENCES public.diagnosticos(id_diagnostico);


--
-- TOC entry 5072 (class 2606 OID 16631)
-- Name: factura_diagnostico_puente factura_diagnostico_puente_id_factura_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.factura_diagnostico_puente
    ADD CONSTRAINT factura_diagnostico_puente_id_factura_fkey FOREIGN KEY (id_factura) REFERENCES public.facturas(id_factura);


--
-- TOC entry 5067 (class 2606 OID 16596)
-- Name: facturas facturas_id_cliente_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.facturas
    ADD CONSTRAINT facturas_id_cliente_fkey FOREIGN KEY (id_cliente) REFERENCES public.clientes(id_cliente);


--
-- TOC entry 5068 (class 2606 OID 16591)
-- Name: facturas facturas_id_ot_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.facturas
    ADD CONSTRAINT facturas_id_ot_fkey FOREIGN KEY (id_ot) REFERENCES public.ordenes_trabajo(id_ot);


--
-- TOC entry 5077 (class 2606 OID 16742)
-- Name: favorites favorites_movie_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.favorites
    ADD CONSTRAINT favorites_movie_id_fkey FOREIGN KEY (movie_id) REFERENCES public.movies(id) ON DELETE CASCADE;


--
-- TOC entry 5078 (class 2606 OID 16737)
-- Name: favorites favorites_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.favorites
    ADD CONSTRAINT favorites_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- TOC entry 5058 (class 2606 OID 16453)
-- Name: materiales_repuestos materiales_repuestos_id_impuesto_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.materiales_repuestos
    ADD CONSTRAINT materiales_repuestos_id_impuesto_fkey FOREIGN KEY (id_impuesto) REFERENCES public.impuestos(id_impuesto);


--
-- TOC entry 5065 (class 2606 OID 16562)
-- Name: ordenes_trabajo ordenes_trabajo_id_diagnostico_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ordenes_trabajo
    ADD CONSTRAINT ordenes_trabajo_id_diagnostico_fkey FOREIGN KEY (id_diagnostico) REFERENCES public.diagnosticos(id_diagnostico);


--
-- TOC entry 5066 (class 2606 OID 16567)
-- Name: ordenes_trabajo ordenes_trabajo_id_mecanico_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ordenes_trabajo
    ADD CONSTRAINT ordenes_trabajo_id_mecanico_fkey FOREIGN KEY (id_mecanico) REFERENCES public.usuarios(id_usuario);


--
-- TOC entry 5075 (class 2606 OID 16691)
-- Name: pagos_detalle pagos_detalle_id_cxc_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pagos_detalle
    ADD CONSTRAINT pagos_detalle_id_cxc_fkey FOREIGN KEY (id_cxc) REFERENCES public.cuentas_por_cobrar(id_cxc);


--
-- TOC entry 5076 (class 2606 OID 16686)
-- Name: pagos_detalle pagos_detalle_id_pago_maestro_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pagos_detalle
    ADD CONSTRAINT pagos_detalle_id_pago_maestro_fkey FOREIGN KEY (id_pago_maestro) REFERENCES public.pagos_maestro(id_pago_maestro);


--
-- TOC entry 5074 (class 2606 OID 16671)
-- Name: pagos_maestro pagos_maestro_id_cliente_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pagos_maestro
    ADD CONSTRAINT pagos_maestro_id_cliente_fkey FOREIGN KEY (id_cliente) REFERENCES public.clientes(id_cliente);


--
-- TOC entry 5057 (class 2606 OID 16423)
-- Name: usuarios usuarios_id_rol_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.usuarios
    ADD CONSTRAINT usuarios_id_rol_fkey FOREIGN KEY (id_rol) REFERENCES public.roles(id_rol);


-- Completed on 2026-07-06 17:39:47

--
-- PostgreSQL database dump complete
--

\unrestrict CBgJUXI0b0dqQ57F2oLxZFYHHs7eY9e3hIqwHznfIMj2TR4XYZHS0BeIFaeKFIx

