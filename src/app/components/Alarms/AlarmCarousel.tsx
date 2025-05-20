import React, { useRef, useEffect, useCallback } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { debounce } from "../../Alarm/utils";

interface CarouselProps {
  options: string[];
  selected: string;
  onChange: (value: string) => void;
}

export default React.memo<CarouselProps>(({ options, selected, onChange }) => {
  const carouselRef = useRef<HTMLDivElement>(null);
  const isScrolling = useRef(false);

  const scrollToSelected = useCallback(() => {
    if (carouselRef.current && !isScrolling.current) {
      const selectedElement = carouselRef.current.querySelector(
        `[data-value="${selected}"]`
      );
      if (selectedElement) {
        selectedElement.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
      }
    }
  }, [selected]);

  useEffect(() => {
    scrollToSelected();
  }, [selected, scrollToSelected]);

  useEffect(() => {
    const carousel = carouselRef.current;
    if (!carousel) return;

    const handleScroll = () => {
      const options = carousel.querySelectorAll("[data-value]");
      let closestOption = null;
      let closestDistance = Infinity;

      const carouselRect = carousel.getBoundingClientRect();
      const carouselCenter = carouselRect.top + carouselRect.height / 2;

      options.forEach((option) => {
        const rect = option.getBoundingClientRect();
        const optionCenter = rect.top + rect.height / 2;
        const distance = Math.abs(optionCenter - carouselCenter);

        if (distance < closestDistance) {
          closestDistance = distance;
          closestOption = option;
        }
      });

      if (
        closestOption &&
        closestOption.getAttribute("data-value") !== selected
      ) {
        onChange(closestOption.getAttribute("data-value") || "");
      }
    };

    const handleScrollStart = () => {
      isScrolling.current = true;
    };

    const handleScrollEnd = debounce(() => {
      isScrolling.current = false;
      handleScroll();
    }, 150);

    carousel.addEventListener("touchstart", handleScrollStart);
    carousel.addEventListener("mousedown", handleScrollStart);
    carousel.addEventListener("scroll", handleScrollEnd);

    return () => {
      carousel.removeEventListener("touchstart", handleScrollStart);
      carousel.removeEventListener("mousedown", handleScrollStart);
      carousel.removeEventListener("scroll", handleScrollEnd);
    };
  }, [selected, onChange]);

  const handleUpClick = () => {
    const currentIndex = options.indexOf(selected);
    const newIndex = currentIndex > 0 ? currentIndex - 1 : options.length - 1;
    onChange(options[newIndex]);
  };

  const handleDownClick = () => {
    const currentIndex = options.indexOf(selected);
    const newIndex = currentIndex < options.length - 1 ? currentIndex + 1 : 0;
    onChange(options[newIndex]);
  };

  return (
    <div className="flex flex-col items-center">
      <button
        onClick={handleUpClick}
        className="cursor-pointer rounded active:scale-95 border w-full p-1 h-8 flex items-center justify-center"
        aria-label="Scroll up"
      >
        <ChevronUp />
      </button>

      <div
        ref={carouselRef}
        className="flex flex-col items-center overflow-y-auto h-20 scroll-smooth hide-scrollbar snap-y snap-mandatory"
        style={{ scrollBehavior: "smooth" }}
      >
        <div className="h-8 invisible" />
        {options.map((option) => (
          <div
            key={option}
            data-value={option}
            className={`p-2 text-6xl font-bold snap-center ${
              option === selected ? "text-white rounded-lg" : "text-gray-700"
            }`}
            onClick={() => onChange(option)}
          >
            {option}
          </div>
        ))}
        <div className="h-8 invisible" />
      </div>

      <button
        onClick={handleDownClick}
        className="cursor-pointer active:scale-95 rounded border w-full p-1 h-8 flex items-center justify-center"
        aria-label="Scroll down"
      >
        <ChevronDown />
      </button>
    </div>
  );
});
