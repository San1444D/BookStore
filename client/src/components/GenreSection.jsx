
import React from "react";
import { ALL_GENRES, GENRES_IMAGES } from "../assets/assets";
import { useNavigate } from "react-router-dom";
import {motion} from "motion/react";

const GenreSection = () => {
  const navigate = useNavigate();

  return (
    <motion.section
      initial={{ opacity: 0.2, y: 100 }}
      transition={{ duration: 1, }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="bg-primary-home py-10! px-6! md:px-12!"
    >
      <div className="max-w-6xl mx-auto!">
        <div className="text-center mb-8! ">
          <h2 className="text-xl text-primary-btn  md:text-3xl font-semibold">
            Genres
          </h2>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-6!">
          {ALL_GENRES.map((genre) => (
            <div
              key={genre}
              onClick={() =>
                navigate(`/books?genre=${encodeURIComponent(genre)}`)
              }
              className="flex flex-col items-center text-center group cursor-pointer"
            >
              {/* circular card with book image */}
              <div className="w-28! h-28! md:w-32! md:h-32! rounded-full border border-gray-200 flex items-center justify-center bg-gray-50 group-hover:shadow-2xl group-hover:scale-105  group-hover:border-primary-btn transition-all">
                <img
                  src={GENRES_IMAGES[genre]}
                  alt={genre}
                  className="w-16! h-24! object-cover rounded shadow-md  transition-transform"
                />
              </div>

              {/* label */}
              <p className="mt-3! text-xs md:text-sm font-medium text-gray-800 leading-tight">
                {genre}
              </p>
            </div>
          ))}
        </div>
      </div>
    </motion.section>
  );
};

export default GenreSection;
