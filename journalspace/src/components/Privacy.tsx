import { Shield, Lock, Eye, Server } from "lucide-react";

const privacyFeatures = [
  {
    icon: Shield,
    title: "End-to-End Encryption",
    description:
      "Your entries are encrypted before they leave your device. Only you hold the keys to your thoughts.",
  },
  {
    icon: Lock,
    title: "Zero-Knowledge Architecture",
    description:
      "We can't read your journal even if we wanted to. Your privacy is protected by design, not promises.",
  },
  {
    icon: Eye,
    title: "No Tracking, No Ads",
    description:
      "We don't track your behavior or sell your data. Your journaling habits stay completely private.",
  },
  {
    icon: Server,
    title: "Local-First Storage",
    description:
      "Your data lives on your device first. Cloud sync is optional and always encrypted.",
  },
];

export default function Privacy() {
  return (
    <section id="privacy" className="section-padding bg-sage-50">
      <div className="container-max">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-sage-900 mb-4">
            Your Thoughts Deserve Privacy
          </h2>
          <p className="text-lg text-sage-600 leading-relaxed">
            Journaling is deeply personal. That&apos;s why we&apos;ve built JournalSpace
            with privacy at its core—not as an afterthought, but as the foundation.
          </p>
        </div>

        {/* Privacy Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {privacyFeatures.map((feature) => (
            <div
              key={feature.title}
              className="flex gap-4 p-6 bg-white rounded-xl border border-sage-100 hover:shadow-md transition-shadow"
            >
              <div className="flex-shrink-0">
                <div className="p-3 bg-sage-100 rounded-lg">
                  <feature.icon
                    className="h-6 w-6 text-sage-600"
                    aria-hidden="true"
                  />
                </div>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-sage-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-sage-600 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Trust Badge */}
        <div className="mt-12 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-sage-200 rounded-full text-sm text-sage-600">
            <Shield className="h-4 w-4 text-sage-500" aria-hidden="true" />
            <span>Independently audited security practices</span>
          </div>
        </div>
      </div>
    </section>
  );
}
