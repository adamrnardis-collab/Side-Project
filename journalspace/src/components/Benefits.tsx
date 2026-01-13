import { Check, Quote } from "lucide-react";

const benefits = [
  "Reduce stress and anxiety through expressive writing",
  "Gain clarity on your thoughts and emotions",
  "Track personal growth and celebrate progress",
  "Improve memory and cognitive processing",
  "Build self-awareness and emotional intelligence",
  "Create a meaningful record of your life's journey",
];

const testimonials = [
  {
    quote:
      "I started with just one sentence a day. Six months later, I've filled pages with insights I never knew I had. JournalSpace made reflection feel natural.",
    author: "Sarah M.",
    role: "Teacher & Parent",
  },
  {
    quote:
      "As someone who values privacy above all, finding a journal app that actually respects it was a game-changer. I finally feel safe writing honestly.",
    author: "Michael R.",
    role: "Software Engineer",
  },
];

export default function Benefits() {
  return (
    <section className="section-padding bg-white">
      <div className="container-max">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-start">
          {/* Benefits List */}
          <div>
            <h2 className="text-3xl sm:text-4xl font-bold text-sage-900 mb-4">
              Why Journaling Transforms Lives
            </h2>
            <p className="text-lg text-sage-600 mb-8 leading-relaxed">
              Research shows that regular journaling can improve mental health,
              boost creativity, and help you achieve your goals. Here&apos;s what
              you&apos;ll discover:
            </p>

            <ul className="space-y-4" role="list">
              {benefits.map((benefit, index) => (
                <li key={index} className="flex items-start gap-3">
                  <div className="flex-shrink-0 mt-1">
                    <div className="p-1 bg-sage-100 rounded-full">
                      <Check
                        className="h-4 w-4 text-sage-600"
                        aria-hidden="true"
                      />
                    </div>
                  </div>
                  <span className="text-sage-700">{benefit}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Testimonials */}
          <div className="space-y-6">
            <h3 className="text-xl font-semibold text-sage-900 mb-6">
              Stories from Our Community
            </h3>
            {testimonials.map((testimonial, index) => (
              <div
                key={index}
                className="relative p-6 bg-sage-50 rounded-xl border border-sage-100"
              >
                <Quote
                  className="absolute top-4 right-4 h-8 w-8 text-sage-200"
                  aria-hidden="true"
                />
                <blockquote className="relative">
                  <p className="text-sage-700 leading-relaxed mb-4 italic">
                    &quot;{testimonial.quote}&quot;
                  </p>
                  <footer className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 bg-sage-200 rounded-full flex items-center justify-center text-sage-600 font-semibold"
                      aria-hidden="true"
                    >
                      {testimonial.author[0]}
                    </div>
                    <div>
                      <cite className="not-italic font-medium text-sage-900">
                        {testimonial.author}
                      </cite>
                      <p className="text-sm text-sage-500">{testimonial.role}</p>
                    </div>
                  </footer>
                </blockquote>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
