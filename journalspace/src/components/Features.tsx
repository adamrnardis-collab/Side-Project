import { Lightbulb, Calendar, TrendingUp, Heart } from "lucide-react";

const features = [
  {
    icon: Lightbulb,
    title: "Daily Prompts",
    description:
      "Never face a blank page. Get thoughtful prompts that spark reflection and help you discover insights you might have missed.",
    color: "bg-amber-100 text-amber-600",
  },
  {
    icon: Calendar,
    title: "Story Timeline",
    description:
      "Browse through your past entries like chapters of a book. See patterns, growth, and how far you've come over time.",
    color: "bg-blue-100 text-blue-600",
  },
  {
    icon: TrendingUp,
    title: "Progress Insights",
    description:
      "Track your journaling streak, writing habits, and emotional patterns. Celebrate consistency without pressure.",
    color: "bg-green-100 text-green-600",
  },
  {
    icon: Heart,
    title: "Gratitude Practice",
    description:
      "Built-in gratitude prompts help you cultivate appreciation and shift focus to what matters most in your life.",
    color: "bg-rose-100 text-rose-600",
  },
];

export default function Features() {
  return (
    <section id="features" className="section-padding bg-warm-50">
      <div className="container-max">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-sage-900 mb-4">
            Simple Tools for Meaningful Reflection
          </h2>
          <p className="text-lg text-sage-600 leading-relaxed">
            JournalSpace is designed to get out of your way and let you focus on
            what matters—capturing your thoughts and understanding yourself better.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="group p-6 bg-white rounded-xl border border-sage-100 hover:shadow-lg hover:border-sage-200 transition-all duration-300"
            >
              <div
                className={`inline-flex p-3 rounded-lg ${feature.color} mb-4 group-hover:scale-110 transition-transform duration-300`}
              >
                <feature.icon className="h-6 w-6" aria-hidden="true" />
              </div>
              <h3 className="text-lg font-semibold text-sage-900 mb-2">
                {feature.title}
              </h3>
              <p className="text-sage-600 leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
