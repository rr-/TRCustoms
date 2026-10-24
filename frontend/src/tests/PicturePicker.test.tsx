import { fireEvent } from "@testing-library/react";
import { screen } from "@testing-library/react";
import { PicturePicker } from "src/components/common/PicturePicker";
import { FileService } from "src/services/FileService";
import type { UploadedFile } from "src/services/FileService";
import { UploadType } from "src/services/FileService";
import { renderRoute } from "src/tests/renderRoute";
import { DisplayMode } from "src/types";
import { beforeEach } from "vitest";
import { describe } from "vitest";
import { expect } from "vitest";
import { test } from "vitest";
import { vi } from "vitest";

const renderPicker = (displayMode: DisplayMode) => {
  vi.spyOn(FileService, "getFileById").mockResolvedValue({
    id: 1,
    url: "/cover.png",
  } as UploadedFile);
  renderRoute(
    <PicturePicker
      displayMode={displayMode}
      allowClear={true}
      uploadType={UploadType.LevelCover}
      fileIds={[1]}
    />,
    { path: "/", entry: "/" },
  );
};

const loadImage = async (width: number, height: number) => {
  const image = await screen.findByAltText("Upload preview");
  Object.defineProperty(image, "naturalWidth", { value: width });
  Object.defineProperty(image, "naturalHeight", { value: height });
  fireEvent.load(image);
};

describe("PicturePicker cover crop preview", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  test("marks the sides of a wide image as cropped", async () => {
    renderPicker(DisplayMode.Cover);

    await loadImage(1600, 600);

    expect(
      screen.getByText("Everything outside the box below will be cropped:"),
    ).toBeInTheDocument();
    expect(screen.getByLabelText("Cover crop area")).toHaveStyle({
      top: "0%",
      bottom: "0%",
      left: "25%",
      right: "25%",
    });
  });

  test("marks the top and bottom of a tall image as cropped", async () => {
    renderPicker(DisplayMode.Cover);

    await loadImage(400, 600);

    expect(screen.getByLabelText("Cover crop area")).toHaveStyle({
      top: "25%",
      bottom: "25%",
      left: "0%",
      right: "0%",
    });
  });

  test("leaves a 4:3 image alone", async () => {
    renderPicker(DisplayMode.Cover);

    await loadImage(800, 600);

    expect(screen.queryByText(/will be cropped/)).not.toBeInTheDocument();
    expect(screen.queryByLabelText("Cover crop area")).not.toBeInTheDocument();
  });

  test("does not mark crops on contained pictures", async () => {
    renderPicker(DisplayMode.Contain);

    await loadImage(1600, 600);

    expect(screen.queryByLabelText("Cover crop area")).not.toBeInTheDocument();
  });
});
