"use client";

import * as React from "react";

import createCache, { type EmotionCache } from "@emotion/cache";
import { CacheProvider } from "@emotion/react";
import { CssBaseline, ThemeProvider } from "@mui/material";
import { useServerInsertedHTML } from "next/navigation";

import { appTheme } from "@/shared/ui/theme/app-theme";

type ThemeRegistryProps = {
  children: React.ReactNode;
};

type EmotionState = {
  cache: EmotionCache;
  flush: () => string[];
};

function createEmotionState(): EmotionState {
  const cache = createCache({ key: "mui" });
  cache.compat = true;

  const insertedNames: string[] = [];
  const insert = cache.insert;

  cache.insert = (...args: Parameters<typeof insert>) => {
    const serialized = args[1];

    if (cache.inserted[serialized.name] === undefined) {
      insertedNames.push(serialized.name);
    }

    return insert(...args);
  };

  return {
    cache,
    flush: () => {
      const names = [...insertedNames];
      insertedNames.length = 0;
      return names;
    }
  };
}

export function ThemeRegistry({ children }: ThemeRegistryProps) {
  const [{ cache, flush }] = React.useState(createEmotionState);

  useServerInsertedHTML(() => {
    const names = flush();

    if (names.length === 0) {
      return null;
    }

    let styles = "";

    for (const name of names) {
      const style = cache.inserted[name];

      if (typeof style === "string") {
        styles += style;
      }
    }

    return (
      <style
        data-emotion={`${cache.key} ${names.join(" ")}`}
        dangerouslySetInnerHTML={{ __html: styles }}
      />
    );
  });

  return (
    <CacheProvider value={cache}>
      <ThemeProvider theme={appTheme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </CacheProvider>
  );
}
