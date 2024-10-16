import { motion } from "framer-motion";

export default function DisplayLudgi() {
    return (
        <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 0.5 }}
            className="mt-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg shadow-lg p-6 max-w-md w-full"
        >
            <h2 className="text-2xl font-bold mb-4 text-white">
                Monetize Your AI-Generated Images
            </h2>
            <p className="text-lg font-semibold text-white mb-4">
                Sell your AI-generated images and earn revenue with ludgi.ai!
            </p>
            <a
                href="https://ludgi.ai"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block bg-white text-blue-600 px-6 py-3 rounded-full font-bold hover:bg-blue-100 transition-colors text-lg"
            >
                Get Started Now
            </a>
        </motion.div>
    );
}