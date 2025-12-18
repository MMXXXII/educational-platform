import type { Route } from "./+types/about";

export function meta({ }: Route.MetaArgs) {
    return [
        { title: "О платформе | EduPlatform" },
        { name: "description", content: "Образовательная платформа с 3D элементами и визуальным программированием" },
    ];
}

export default function AboutPage() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-slate-50">
            {/* Hero Section */}
            <div className="relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-900/20 via-purple-900/20 to-slate-900/20" />
                <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
                    <div className="text-center">
                        <h1 className="text-4xl md:text-6xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 mb-6">
                            Образовательная платформа
                        </h1>
                        <p className="text-xl text-slate-300 max-w-3xl mx-auto mb-10">
                            Инновационная платформа для изучения программирования через визуальное 
                            конструирование и 3D-визуализацию алгоритмов
                        </p>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
                    {/* Mission */}
                    <div className="bg-slate-900/50 backdrop-blur-sm border border-slate-800 rounded-2xl p-8">
                        <h2 className="text-2xl font-bold text-white mb-4 flex items-center">
                            <span className="h-2 w-2 bg-blue-500 rounded-full mr-3"></span>
                            Наша миссия
                        </h2>
                        <p className="text-slate-300 leading-relaxed">
                            Сделать обучение программированию доступным, интерактивным и увлекательным 
                            для студентов любого уровня. Мы объединяем визуальное программирование, 
                            3D-визуализацию и игровые механики для создания уникального образовательного опыта.
                        </p>
                    </div>

                    {/* Technologies */}
                    <div className="bg-slate-900/50 backdrop-blur-sm border border-slate-800 rounded-2xl p-8">
                        <h2 className="text-2xl font-bold text-white mb-4 flex items-center">
                            <span className="h-2 w-2 bg-purple-500 rounded-full mr-3"></span>
                            Технологии
                        </h2>
                        <div className="space-y-3">
                            {[
                                { name: "React + TypeScript", desc: "Современный фронтенд" },
                                { name: "FastAPI + Python", desc: "Высокопроизводительный бэкенд" },
                                { name: "Three.js / React Three Fiber", desc: "3D-визуализация" },
                                { name: "React Flow", desc: "Визуальное программирование" },
                                { name: "PostgreSQL", desc: "Надежное хранение данных" },
                            ].map((tech, idx) => (
                                <div key={idx} className="flex items-center p-3 bg-slate-800/30 rounded-lg">
                                    <div className="h-3 w-3 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 mr-3"></div>
                                    <div>
                                        <div className="font-medium text-white">{tech.name}</div>
                                        <div className="text-sm text-slate-400">{tech.desc}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Features */}
                <div className="mb-16">
                    <h2 className="text-3xl font-bold text-center text-white mb-12">
                        Ключевые возможности
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {[
                            {
                                title: "Визуальный редактор кода",
                                desc: "Создавайте алгоритмы через перетаскивание блоков без написания кода",
                                color: "from-blue-500 to-cyan-500",
                            },
                            {
                                title: "3D-визуализация",
                                desc: "Наблюдайте выполнение алгоритмов в трехмерном пространстве",
                                color: "from-purple-500 to-pink-500",
                            },
                            {
                                title: "Интерактивные курсы",
                                desc: "Пошаговое обучение с практическими заданиями",
                                color: "from-green-500 to-emerald-500",
                            },
                            {
                                title: "Файловый менеджер",
                                desc: "Удобное хранение и организация учебных материалов",
                                color: "from-orange-500 to-red-500",
                            },
                            {
                                title: "Система ролей",
                                desc: "Разделение на студентов, преподавателей и администраторов",
                                color: "from-indigo-500 to-blue-500",
                            },
                            {
                                title: "Редактор сцен",
                                desc: "Создавайте 3D-сцены для визуализации алгоритмов",
                                color: "from-yellow-500 to-orange-500",
                            },
                        ].map((feature, idx) => (
                            <div 
                                key={idx} 
                                className="group bg-slate-900/40 border border-slate-800 rounded-xl p-6 hover:border-slate-700 transition-all duration-300 hover:scale-[1.02]"
                            >
                                <div className={`h-1 w-12 rounded-full bg-gradient-to-r ${feature.color} mb-4`}></div>
                                <h3 className="text-xl font-bold text-white mb-3">{feature.title}</h3>
                                <p className="text-slate-400">{feature.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Team / Contact */}
                <div className="bg-gradient-to-r from-slate-900/80 to-slate-800/80 border border-slate-800 rounded-2xl p-8">
                    <h2 className="text-2xl font-bold text-white mb-6 text-center">
                        Контакты и развитие
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
                        <div>
                            <div className="text-4xl font-bold text-blue-400 mb-2">2024</div>
                            <div className="text-slate-400">Год создания</div>
                        </div>
                        <div>
                            <div className="text-4xl font-bold text-purple-400 mb-2">3+</div>
                            <div className="text-slate-400">Технологических стека</div>
                        </div>
                        <div>
                            <div className="text-4xl font-bold text-green-400 mb-2">∞</div>
                            <div className="text-slate-400">Возможностей для обучения</div>
                        </div>
                    </div>
                    <div className="mt-8 pt-8 border-t border-slate-800 text-center">
                        <p className="text-slate-400">
                            Платформа находится в активной разработке. Мы открыты для 
                            обратной связи и сотрудничества с образовательными учреждениями.
                        </p>
                    </div>
                </div>
            </div>

            {/* Footer Note */}
            <div className="border-t border-slate-800 py-8 text-center">
                <p className="text-slate-500 text-sm">
                    © {new Date().getFullYear()} Образовательная платформа. Все права защищены.
                </p>
            </div>
        </div>
    );
}