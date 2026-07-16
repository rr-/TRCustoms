// Ambient declarations for third-party modules that ship no type
// definitions. Only the surface actually used by MapWidget is declared.
declare module "react-simple-maps" {
  import type { ComponentType, CSSProperties, ReactNode } from "react";

  // A GeoJSON feature augmented by react-simple-maps with a stable render key.
  export interface RSMGeography {
    rsmKey: string;
    id?: string | number;
    properties?: Record<string, unknown>;
    [key: string]: unknown;
  }

  export const ComposableMap: ComponentType<{
    width?: number;
    height?: number;
    projection?: unknown;
    projectionConfig?: Record<string, unknown>;
    style?: CSSProperties;
    children?: ReactNode;
  }>;

  export const Geographies: ComponentType<{
    geography: unknown;
    children: (args: { geographies: RSMGeography[] }) => ReactNode;
  }>;

  export const Geography: ComponentType<{
    geography: RSMGeography;
    onClick?: () => void;
    className?: string;
    style?: Record<string, CSSProperties>;
  }>;
}

declare module "d3-geo-projection" {
  // A minimal chainable projection; only the methods MapWidget calls.
  interface D3Projection {
    translate(coords: [number, number]): D3Projection;
    scale(scale: number): D3Projection;
  }
  export function geoCylindricalStereographic(): D3Projection;
}

declare module "topojson-client" {
  export function feature(
    topology: unknown,
    object: unknown,
  ): { features: Array<Record<string, unknown>> };
}

// Flag polled by the prerender service to know when a page has finished
// rendering.
interface Window {
  prerenderReady?: boolean;
}
