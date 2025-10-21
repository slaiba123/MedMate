import { Headphones, Star, HeartPulse } from "lucide-react";

const highlights = [
  {
    icon: <Headphones className="w-10 h-10 text-white" />,
    title: "24 hour service",
    description: "Lorem ipsum dolor sit amet, consectetur adipiscing.",
  },
  {
    icon: <Star className="w-10 h-10 text-white" />,
    title: "8 years of experience",
    description: "Lorem ipsum dolor sit amet, consectetur adipiscing.",
  },
  {
    icon: <HeartPulse className="w-10 h-10 text-white" />,
    title: "High quality care",
    description: "Lorem ipsum dolor sit amet, consectetur adipiscing.",
  },
];

export default function HighlightsSection() {
  return (
    <section className="bg-[#a280ff] py-12 px-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto text-center text-white">
        {highlights.map((item, index) => (
          <div key={index} className="flex flex-col items-center">
            <div className="mb-3">{item.icon}</div>
            <h4 className="text-xl font-semibold">{item.title}</h4>
            <p className="text-sm mt-2">{item.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
