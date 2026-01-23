/* ============================================
   NAVIGATOR KIDS AI - QUIZ MODULE
   quiz.js - Brain profile quiz logic
   ============================================ */

(function() {
    'use strict';

    // =========================================
    // QUIZ CONFIGURATION
    // =========================================
    const QUIZ_CONFIG = {
        storageKey: 'quizResults',
        profileStorageKey: 'quizProfile',
        autoAdvanceDelay: 350,
        loadingDuration: 1500
    };

    // =========================================
    // QUESTIONS DATA
    // =========================================
    const QUESTIONS = [
        {
            id: 'executive',
            category: 'Task Initiation',
            emoji: '🎯',
            question: "When it's time to start homework or a chore, your child typically...",
            options: [
                { text: "Jumps right in without much prompting", score: 1 },
                { text: "Needs a reminder but then gets going", score: 2 },
                { text: "Delays and needs multiple reminders", score: 3 },
                { text: "Actively avoids or melts down before starting", score: 4 }
            ]
        },
        {
            id: 'sensory',
            category: 'Sensory Processing',
            emoji: '🌡️',
            question: "How does your child react to busy, loud, or overwhelming environments?",
            options: [
                { text: "Handles them easily, no problem", score: 1 },
                { text: "Gets tired but manages okay", score: 2 },
                { text: "Becomes noticeably stressed or irritable", score: 3 },
                { text: "Shuts down, hides, or has meltdowns", score: 4 }
            ]
        },
        {
            id: 'emotional',
            category: 'Emotional Intensity',
            emoji: '💗',
            question: "When something upsets your child (even something small), they...",
            options: [
                { text: "Recover quickly and move on", score: 1 },
                { text: "Feel it strongly but calm down with support", score: 2 },
                { text: "Get stuck in the emotion for a while", score: 3 },
                { text: "Experience intense, prolonged reactions", score: 4 }
            ]
        },
        {
            id: 'motivation',
            category: 'Motivation Pattern',
            emoji: '🚀',
            question: "Your child's effort and engagement depends on...",
            options: [
                { text: "They work consistently on most things", score: 1 },
                { text: "They prefer interesting tasks but do required ones", score: 2 },
                { text: "They only engage when the topic excites them", score: 3 },
                { text: "Interest is everything — no interest, no effort", score: 4 }
            ]
        },
        {
            id: 'social',
            category: 'Social Energy',
            emoji: '🤝',
            question: "After a full day at school, your child is usually...",
            options: [
                { text: "Ready to play and hang out with friends", score: 1 },
                { text: "Okay but needs some quiet time first", score: 2 },
                { text: "Exhausted and needs an hour alone to reboot", score: 3 },
                { text: "Explosive — they held it together all day and now crash", score: 4 }
            ]
        },
        {
            id: 'perfectionism',
            category: 'Perfectionism',
            emoji: '⭐',
            question: "When your child makes a mistake or doesn't meet their own expectations...",
            options: [
                { text: "They shrug it off and try again", score: 1 },
                { text: "They're briefly frustrated but move on", score: 2 },
                { text: "They get upset and may avoid trying again", score: 3 },
                { text: "They have a major emotional reaction or refuse to continue", score: 4 }
            ]
        },
        {
            id: 'avoidance',
            category: 'Task Overwhelm',
            emoji: '🧩',
            question: "When faced with a multi-step task or project, your child...",
            options: [
                { text: "Breaks it down and works through it", score: 1 },
                { text: "Needs some help getting started, then is fine", score: 2 },
                { text: "Gets overwhelmed and freezes up", score: 3 },
                { text: "Avoids it completely or has a big emotional reaction", score: 4 }
            ]
        },
        {
            id: 'learning',
            category: 'Learning Style',
            emoji: '📚',
            question: "Your child learns best when...",
            options: [
                { text: "Following step-by-step instructions", score: 1 },
                { text: "They understand the 'why' behind things", score: 2 },
                { text: "They can explore deeply at their own pace", score: 3 },
                { text: "They're in complete control of what and how they learn", score: 4 }
            ]
        }
    ];

    // =========================================
    // PROFILE DEFINITIONS
    // =========================================
    const PROFILES = {
        'intense-feeler': {
            name: 'Intense Feeler',
            icon: '🔥',
            url: '/results/intense-feeler/',
            character: 'Ember the Dragon',
            description: 'Big emotions, sensory sensitivity, and deep feelings',
            weights: { emotional: 3, sensory: 2, perfectionism: 2 }
        },
        'reluctant-starter': {
            name: 'Reluctant Starter',
            icon: '🐢',
            url: '/results/reluctant-starter/',
            character: 'Shelly the Turtle',
            description: 'Task initiation challenges and interest-based focus',
            weights: { executive: 3, avoidance: 2, motivation: 2 }
        },
        'deep-diver': {
            name: 'Deep Diver',
            icon: '🦉',
            url: '/results/deep-diver/',
            character: 'Sketch the Owl',
            description: 'Intense interests, hyperfocus, and deep learning',
            weights: { learning: 3, motivation: 2, perfectionism: 2 }
        },
        'sensitive-observer': {
            name: 'Sensitive Observer',
            icon: '🐰',
            url: '/results/sensitive-observer/',
            character: 'Whisper Bunny',
            description: 'Sensory processing sensitivity and social energy management',
            weights: { sensory: 3, social: 2, emotional: 2 }
        },
        'bold-explorer': {
            name: 'Bold Explorer',
            icon: '🦁',
            url: '/results/bold-explorer/',
            character: 'Bravely the Lion',
            description: 'Novelty-seeking, quick starts, and confidence building',
            weights: { social: -2, motivation: 2, learning: 1 },
            inverse: ['social']
        },
        'big-picture-thinker': {
            name: 'Big Picture Thinker',
            icon: '🚀',
            url: '/results/big-picture-thinker/',
            character: 'Cosmo Space Pup',
            description: 'Executive function, organization, and transitions',
            weights: { executive: 2, learning: 3, avoidance: 2 }
        }
    };

    // Trait labels for display
    const TRAIT_LABELS = {
        executive: 'Task Initiation',
        sensory: 'Sensory Sensitivity',
        emotional: 'Emotional Intensity',
        motivation: 'Interest-Based Drive',
        social: 'Social Recovery Need',
        perfectionism: 'Perfectionism',
        avoidance: 'Task Overwhelm',
        learning: 'Learning Autonomy'
    };

    // =========================================
    // QUIZ CLASS
    // =========================================
    class NavigatorQuiz {
        constructor(options = {}) {
            this.currentQuestion = 0;
            this.answers = {};
            this.childName = 'Your child';
            this.parentEmail = '';
            this.primaryProfile = null;
            this.secondaryProfile = null;
            
            // Callbacks
            this.onQuestionChange = options.onQuestionChange || (() => {});
            this.onComplete = options.onComplete || (() => {});
            this.onResultsReady = options.onResultsReady || (() => {});
        }

        // Get current question
        getCurrentQuestion() {
            return QUESTIONS[this.currentQuestion];
        }

        // Get total questions
        getTotalQuestions() {
            return QUESTIONS.length;
        }

        // Get progress percentage
        getProgress() {
            return ((this.currentQuestion + 1) / QUESTIONS.length) * 100;
        }

        // Answer current question
        answerQuestion(score) {
            const question = this.getCurrentQuestion();
            this.answers[question.id] = score;
        }

        // Check if current question is answered
        isCurrentAnswered() {
            const question = this.getCurrentQuestion();
            return this.answers[question.id] !== undefined;
        }

        // Go to next question
        nextQuestion() {
            if (!this.isCurrentAnswered()) return false;
            
            if (this.currentQuestion < QUESTIONS.length - 1) {
                this.currentQuestion++;
                this.onQuestionChange(this.currentQuestion);
                return true;
            } else {
                this.onComplete();
                return false;
            }
        }

        // Go to previous question
        prevQuestion() {
            if (this.currentQuestion > 0) {
                this.currentQuestion--;
                this.onQuestionChange(this.currentQuestion);
                return true;
            }
            return false;
        }

        // Set user info
        setUserInfo(childName, parentEmail = '') {
            this.childName = childName || 'Your child';
            this.parentEmail = parentEmail;
        }

        // Calculate results
        calculateResults() {
            const profileScores = {};

            // Calculate score for each profile
            for (const [profileId, profile] of Object.entries(PROFILES)) {
                let score = 0;
                
                for (const [trait, weight] of Object.entries(profile.weights)) {
                    const traitScore = this.answers[trait] || 0;
                    
                    // Handle inverse traits
                    if (profile.inverse && profile.inverse.includes(trait)) {
                        score += (5 - traitScore) * Math.abs(weight);
                    } else {
                        score += traitScore * weight;
                    }
                }
                
                profileScores[profileId] = score;
            }

            // Sort profiles by score
            const sorted = Object.entries(profileScores)
                .sort((a, b) => b[1] - a[1]);

            this.primaryProfile = sorted[0][0];
            this.secondaryProfile = sorted[1][0];

            return {
                primary: this.primaryProfile,
                secondary: this.secondaryProfile,
                scores: profileScores,
                traitScores: { ...this.answers }
            };
        }

        // Get results data
        getResults() {
            if (!this.primaryProfile) {
                this.calculateResults();
            }

            return {
                childName: this.childName,
                parentEmail: this.parentEmail,
                primary: {
                    id: this.primaryProfile,
                    ...PROFILES[this.primaryProfile]
                },
                secondary: {
                    id: this.secondaryProfile,
                    ...PROFILES[this.secondaryProfile]
                },
                traitScores: this.answers,
                traitLabels: TRAIT_LABELS
            };
        }

        // Save results to localStorage
        saveResults() {
            const results = this.getResults();
            
            // Full results
            const fullData = {
                childName: this.childName,
                parentEmail: this.parentEmail,
                answers: this.answers,
                primary: this.primaryProfile,
                secondary: this.secondaryProfile,
                completedAt: new Date().toISOString()
            };
            
            localStorage.setItem(QUIZ_CONFIG.storageKey, JSON.stringify(fullData));
            
            // Profile data for result pages
            const profileData = {
                childName: this.childName,
                primary: this.primaryProfile,
                secondary: this.secondaryProfile,
                traitScores: this.answers
            };
            
            localStorage.setItem(QUIZ_CONFIG.profileStorageKey, JSON.stringify(profileData));
            
            return results;
        }

        // Reset quiz
        reset() {
            this.currentQuestion = 0;
            this.answers = {};
            this.childName = 'Your child';
            this.parentEmail = '';
            this.primaryProfile = null;
            this.secondaryProfile = null;
        }
    }

    // =========================================
    // STATIC HELPERS
    // =========================================
    
    // Get profile by ID
    NavigatorQuiz.getProfile = function(profileId) {
        return PROFILES[profileId] || null;
    };

    // Get all profiles
    NavigatorQuiz.getAllProfiles = function() {
        return PROFILES;
    };

    // Get trait label
    NavigatorQuiz.getTraitLabel = function(traitId) {
        return TRAIT_LABELS[traitId] || traitId;
    };

    // Load saved results
    NavigatorQuiz.loadSavedResults = function() {
        try {
            const data = localStorage.getItem(QUIZ_CONFIG.storageKey);
            return data ? JSON.parse(data) : null;
        } catch (e) {
            return null;
        }
    };

    // Load profile data (for result pages)
    NavigatorQuiz.loadProfileData = function() {
        try {
            const data = localStorage.getItem(QUIZ_CONFIG.profileStorageKey);
            return data ? JSON.parse(data) : null;
        } catch (e) {
            return null;
        }
    };

    // =========================================
    // EXPORT
    // =========================================
    window.NavigatorQuiz = NavigatorQuiz;
    window.QUIZ_QUESTIONS = QUESTIONS;
    window.QUIZ_PROFILES = PROFILES;
    window.QUIZ_TRAIT_LABELS = TRAIT_LABELS;

})();