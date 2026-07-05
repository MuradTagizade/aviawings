"use client";

/**
 * Themed MapLibre wrapper — adapted for Aviawings from the mapcn component
 * (21st.dev / shadcn-style). Trimmed to what we use: Map with globe support,
 * theme-aware Carto basemaps, markers and zoom controls, styled with our
 * design tokens.
 */

import MapLibreGL, { type MarkerOptions } from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import {
  createContext,
  forwardRef,
  useCallback,
  useContext,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";
import { Minus, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

const CARTO_STYLES = {
  dark: "https://basemaps.cartocdn.com/gl/dark-matter-nolabels-gl-style/style.json",
  light: "https://basemaps.cartocdn.com/gl/voyager-nolabels-gl-style/style.json",
};

type Theme = "light" | "dark";

function getDocumentTheme(): Theme {
  if (typeof document === "undefined") return "light";
  return document.documentElement.classList.contains("dark") ? "dark" : "light";
}

/** Follows our .dark class on <html> (set by the site theme toggle) */
function useResolvedTheme(): Theme {
  const [theme, setTheme] = useState<Theme>(getDocumentTheme);
  useEffect(() => {
    const observer = new MutationObserver(() => setTheme(getDocumentTheme()));
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });
    return () => observer.disconnect();
  }, []);
  return theme;
}

type MapContextValue = {
  map: MapLibreGL.Map | null;
  isLoaded: boolean;
};

const MapContext = createContext<MapContextValue | null>(null);

export function useMap() {
  const context = useContext(MapContext);
  if (!context) throw new Error("useMap must be used within a Map component");
  return context;
}

type MapProps = {
  children?: ReactNode;
  className?: string;
  /** Use `{ type: "globe" }` for the 3D globe view */
  projection?: MapLibreGL.ProjectionSpecification;
} & Omit<MapLibreGL.MapOptions, "container" | "style">;

export const Map = forwardRef<MapLibreGL.Map, MapProps>(function Map(
  { children, className, projection, ...props },
  ref
) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [mapInstance, setMapInstance] = useState<MapLibreGL.Map | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const theme = useResolvedTheme();
  const themeRef = useRef(theme);

  useImperativeHandle(ref, () => mapInstance as MapLibreGL.Map, [mapInstance]);

  useEffect(() => {
    if (!containerRef.current) return;

    const map = new MapLibreGL.Map({
      container: containerRef.current,
      style: themeRef.current === "dark" ? CARTO_STYLES.dark : CARTO_STYLES.light,
      renderWorldCopies: false,
      attributionControl: { compact: true },
      ...props,
    });

    const loadHandler = () => {
      if (projection) map.setProjection(projection);
      setIsLoaded(true);
    };
    map.on("load", loadHandler);
    setMapInstance(map);

    return () => {
      map.off("load", loadHandler);
      map.remove();
      setMapInstance(null);
      setIsLoaded(false);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Swap basemap when the site theme changes
  useEffect(() => {
    if (!mapInstance || themeRef.current === theme) return;
    themeRef.current = theme;
    mapInstance.setStyle(theme === "dark" ? CARTO_STYLES.dark : CARTO_STYLES.light);
    if (projection) {
      mapInstance.once("styledata", () => mapInstance.setProjection(projection));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [theme, mapInstance]);

  const contextValue = useMemo(
    () => ({ map: mapInstance, isLoaded }),
    [mapInstance, isLoaded]
  );

  return (
    <MapContext.Provider value={contextValue}>
      <div ref={containerRef} className={cn("relative h-full w-full", className)}>
        {!isLoaded && (
          <div className="skeleton absolute inset-0 z-10" aria-hidden />
        )}
        {mapInstance && children}
      </div>
    </MapContext.Provider>
  );
});

type MapMarkerProps = {
  longitude: number;
  latitude: number;
  children?: ReactNode;
  onClick?: () => void;
} & Omit<MarkerOptions, "element">;

export function MapMarker({
  longitude,
  latitude,
  children,
  onClick,
  ...markerOptions
}: MapMarkerProps) {
  const { map } = useMap();
  const onClickRef = useRef(onClick);

  const marker = useMemo(() => {
    const el = document.createElement("div");
    el.dataset.mapMarker = "true";
    return new MapLibreGL.Marker({ ...markerOptions, element: el }).setLngLat([
      longitude,
      latitude,
    ]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    onClickRef.current = onClick;
  }, [onClick]);

  useEffect(() => {
    if (!map) return;
    const el = marker.getElement();
    const handleClick = () => onClickRef.current?.();
    el.addEventListener("click", handleClick);
    marker.addTo(map);
    return () => {
      el.removeEventListener("click", handleClick);
      marker.remove();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [map]);

  if (marker.getLngLat().lng !== longitude || marker.getLngLat().lat !== latitude) {
    marker.setLngLat([longitude, latitude]);
  }

  return createPortal(
    <div className="relative cursor-pointer">{children}</div>,
    marker.getElement()
  );
}

export function MapControls({ className }: { className?: string }) {
  const { map } = useMap();

  const zoom = useCallback(
    (delta: number) => {
      map?.zoomTo((map.getZoom() ?? 1) + delta, { duration: 300 });
    },
    [map]
  );

  return (
    <div className={cn("absolute right-3 top-3 z-10", className)}>
      <div className="flex flex-col overflow-hidden rounded-xl border border-ink/10 bg-surface shadow-soft">
        <button
          type="button"
          onClick={() => zoom(1)}
          aria-label="Zoom in"
          className="flex h-9 w-9 items-center justify-center border-b border-ink/5 text-ink-soft transition-colors hover:bg-sand hover:text-ink"
        >
          <Plus className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={() => zoom(-1)}
          aria-label="Zoom out"
          className="flex h-9 w-9 items-center justify-center text-ink-soft transition-colors hover:bg-sand hover:text-ink"
        >
          <Minus className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
