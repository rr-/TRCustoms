// Ambient declarations for third-party modules that ship no type
// definitions. They are consumed with loosely-typed (any) values.
declare module "react-simple-maps";
declare module "d3-geo-projection";
declare module "topojson-client";

// Flag polled by the prerender service to know when a page has finished
// rendering.
interface Window {
  prerenderReady?: boolean;
}
