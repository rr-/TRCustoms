import { useEffect } from "react";
import { createContext } from "react";
import { useState } from "react";

interface TitleContextProviderProps {
  children: React.ReactNode;
}

const BASE_TITLE = "TRCustoms";

const TitleContext = createContext<{
  title: string;
  setTitle: (title: string) => void;
}>({ title: "", setTitle: () => {} });

const TitleContextProvider = ({ children }: TitleContextProviderProps) => {
  const [title, setTitle] = useState<string>("");

  useEffect(() => {
    if (title) {
      document.title = `${BASE_TITLE} - ${title}`;
    } else {
      document.title = BASE_TITLE;
    }
  }, [title]);

  return (
    <TitleContext.Provider value={{ title, setTitle }}>
      {children}
    </TitleContext.Provider>
  );
};

export { TitleContextProvider, TitleContext };
