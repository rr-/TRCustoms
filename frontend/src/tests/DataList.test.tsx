import { QueryClient } from "@tanstack/react-query";
import { QueryClientProvider } from "@tanstack/react-query";
import { act } from "@testing-library/react";
import { render } from "@testing-library/react";
import { screen } from "@testing-library/react";
import { DataList } from "src/components/common/DataList";
import { useSettings } from "src/stores/settings";
import { expect } from "vitest";
import { test } from "vitest";

const searchFunc = async (searchQuery: { page?: number | null }) => ({
  results: [{ id: 1, name: "Cavern" }],
  current_page: 1,
  last_page: 1,
  total_count: 1,
  items_on_page: 20,
  next: null,
  previous: null,
  disable_paging: false,
  searchQuery,
});

test("switching to infinite scroll does not reuse paged results", async () => {
  useSettings.setState({ infiniteScroll: false });
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  const list = (
    <QueryClientProvider client={queryClient}>
      <DataList
        queryKey={["things", "list"]}
        searchQuery={{ page: null }}
        searchFunc={searchFunc}
        itemKey={(item) => `${item.id}`}
        itemView={(item) => <span>{item.name}</span>}
      />
    </QueryClientProvider>
  );
  const { rerender } = render(list);
  expect(await screen.findByText("Cavern")).toBeInTheDocument();

  act(() => useSettings.setState({ infiniteScroll: true }));
  rerender(list);

  expect(await screen.findByText("Cavern")).toBeInTheDocument();
});
