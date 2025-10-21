import { Heart, Stethoscope, Brain, Activity } from "lucide-react"; // replace Lungs with Activity


const services = [
  {
    icon: <Heart className="w-10 h-10 text-cyan-600" />,
    title: "Cardiology",
    description: "It uses a dictionary over combined with a handful of model sentence.",
  },
  {
    icon: <Stethoscope className="w-10 h-10 text-cyan-600" />,
    title: "Gastroenterology",
    description: "It uses a dictionary over combined with a handful of model sentence.",
  },
  {
    icon: <Brain className="w-10 h-10 text-cyan-600" />,
    title: "Neurology",
    description: "It uses a dictionary over combined with a handful of model sentence.",
  },
  {
    icon: <Activity className="w-10 h-10 text-cyan-600" />,
    title: "Pulmonology",
    description: "It uses a dictionary over combined with a handful of model sentence.",
  },
];

export default function ServicesSection() {
  return (
    <section className="bg-cyan-600 py-16 px-6 text-center">
      <h3 className="text-white uppercase tracking-widest mb-2">Our Services</h3>
      <h2 className="text-white text-3xl font-bold mb-12">
        Experienced in a variety of medical services
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
        {services.map((service, index) => (
          <div
            key={index}
            className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition"
          >
            <div className="flex justify-center mb-4">{service.icon}</div>
            <h4 className="text-xl font-semibold mb-2 text-gray-900">{service.title}</h4>
            <p className="text-gray-900 text-sm mb-4">{service.description}</p>
            <a
              href="#"
              className="text-cyan-600 font-medium inline-flex items-center hover:underline"
            >
              Explore Now →
            </a>
          </div>
        ))}
      </div>
    </section>
  );
}
