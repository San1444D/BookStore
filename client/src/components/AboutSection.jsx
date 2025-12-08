import React from "react";

const AboutSection = () => {
  return (
    <section className="bg-primary-home/60 h-[40vh] min-h-[40vh] py-12! px-6! md:px-12!">
      <div className="max-w-4xl mx-auto! text-center">
        <h2 className="text-2xl text-primary-btn md:text-3xl font-semibold mb-16!">
          About this bookstore
        </h2>
        <p className="text-sm md:text-base text-text-primary-gray leading-relaxed">
          This marketplace connects passionate readers with independent sellers.
          Every book you see is listed by real people, and soon you will be able
          to rate and review titles to help others discover their next favorite
          read.
        </p>
      </div>
    </section>
  );
};

export default AboutSection;
