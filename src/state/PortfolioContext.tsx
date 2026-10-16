import { createContext, useCallback, useContext, useMemo, useRef, useState, type ReactNode } from "react";

type ProjectOpener = (projectIndex: number) => void;

type PortfolioContextValue = {
  openCaseIndex: number | null;
  openCase: ProjectOpener;
  closeCase: () => void;
  showProjectOnComputer: ProjectOpener;
  registerComputer: (opener: ProjectOpener | null) => void;
};

const PortfolioContext = createContext<PortfolioContextValue | null>(null);

export function PortfolioProvider({ children }: { children: ReactNode }) {
  const [openCaseIndex, setOpenCaseIndex] = useState<number | null>(null);
  const computerOpener = useRef<ProjectOpener | null>(null);

  const openCase = useCallback((projectIndex: number) => setOpenCaseIndex(projectIndex), []);
  const closeCase = useCallback(() => setOpenCaseIndex(null), []);

  const registerComputer = useCallback((opener: ProjectOpener | null) => {
    computerOpener.current = opener;
  }, []);

  const showProjectOnComputer = useCallback((projectIndex: number) => {
    if (computerOpener.current) computerOpener.current(projectIndex);
    else setOpenCaseIndex(projectIndex);
  }, []);

  const value = useMemo(
    () => ({ openCaseIndex, openCase, closeCase, showProjectOnComputer, registerComputer }),
    [openCaseIndex, openCase, closeCase, showProjectOnComputer, registerComputer],
  );

  return <PortfolioContext.Provider value={value}>{children}</PortfolioContext.Provider>;
}

export function usePortfolio() {
  const context = useContext(PortfolioContext);
  if (!context) throw new Error("usePortfolio must be used inside <PortfolioProvider>");
  return context;
}
