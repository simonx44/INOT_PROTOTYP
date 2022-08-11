import { FC, useMemo, useState } from "react";
import { Card } from "primereact/card";
import { Button } from "primereact/button";
import { Dialog } from "primereact/dialog";
import ImageObjectDetector from "./ImageObjectDetector";
import PerformanceMessurement from "./PerformanceMessurement";
import { importAllImages } from "../helper/utilities";

interface IProps {}

const Gallery: FC<IProps> = (props) => {
  const [performanceMode, updatePerformanceMode] = useState(false);
  const [detailView, updateDetailView] = useState({
    isOpen: false,
    image: undefined,
  });
  const images = useMemo(() => {
    const imagesLoaded: Record<string, any> = importAllImages(
      require.context("../images", false, /.jpg|.png|.jpeg/)
    );
    return imagesLoaded;
  }, []);

  const footer = (image: any) => (
    <Button
      className="w-full p-button-outlined"
      label="Determine the passenger type"
      icon="pi pi-eye"
      onClick={() => updateDetailView({ isOpen: true, image: image })}
    />
  );

  return (
    <div className="relative">
      <div style={{ position: "fixed", bottom: "20px", right: "10px" }}>
        <Button
          label="Performance messure"
          icon={"pi pi-chart-bar"}
          onClick={() => updatePerformanceMode(!performanceMode)}
        />
      </div>
      <Dialog
        header={
          !performanceMode ? `${detailView.image}` : "Performance Messurement"
        }
        visible={detailView.isOpen || performanceMode}
        style={{ width: performanceMode ? "50vw" : "90vw" }}
        modal
        onHide={() => {
          updateDetailView({ isOpen: false, image: undefined });
          updatePerformanceMode(false);
        }}
      >
        {!performanceMode ? (
          <ImageObjectDetector img={detailView.image} />
        ) : (
          <PerformanceMessurement />
        )}
      </Dialog>

      <div className="grid">
        {Object.keys(images).map((img) => {
          const imagePath = images[img] ?? "";
          return (
            <div className="col-12 md:col-6 lg:col-4 xl:col-3" key={img}>
              <Card
                className="customCard h-full"
                title={`Image: ${img}`}
                subTitle=""
                footer={footer(imagePath)}
                header={() => (
                  <img alt={img} src={imagePath} className="customCard--img" />
                )}
              ></Card>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Gallery;
