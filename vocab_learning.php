<?php 
    session_start();
  
    include('classes/connect.php');
    include ('classes/auth.php');
    include('classes/app.php');


    $page_title="Vocab Learning";
 

    $Auth=new Auth();
    $user = false;
    if(isset($_SESSION['calamus_userid'])){
        $user =$Auth->check_login($_SESSION['calamus_userid']);
    }

    $App=new App();
    $app=$App->getRand();
    
    include('layouts/header.php');
?>


<style>
/* Flashcard Styles */
.flashcard-container {
    position: relative;
    min-height: 400px;
}

.flashcard-wrapper {
    perspective: 1000px;
}

.flashcard {
    position: relative;
    width: 100%;
    height: 400px;
    transition: transform 0.6s;
    transform-style: preserve-3d;
}

.flashcard.flipped {
    transform: rotateY(180deg);
}

.flashcard-front,
.flashcard-back {
    position: absolute;
    width: 100%;
    height: 100%;
    backface-visibility: hidden;
    border-radius: 12px;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    background: white;
    padding: 30px;
    display: flex;
    align-items: center;
    justify-content: center;
}

.flashcard-back {
    transform: rotateY(180deg);
}

.card-content {
    width: 100%;
    text-align: center;
}

.word-display {
    margin-bottom: 30px;
}

.card-word {
    font-size: 2.5rem;
    font-weight: bold;
    color: #333;
    margin-bottom: 10px;
}

.card-ipa {
    font-size: 1.2rem;
    color: #666;
    font-style: italic;
}

.answer-section {
    margin-bottom: 30px;
    text-align: left;
}

.card-translation {
    font-size: 1.3rem;
    color: #2c3e50;
    margin-bottom: 20px;
    font-weight: 500;
}

.card-examples {
    font-size: 1rem;
    color: #555;
    line-height: 1.6;
}

.card-examples .example {
    margin-bottom: 10px;
    padding-left: 15px;
    border-left: 3px solid #4B93FF;
}

.btn-show-answer,
.btn-skip {
    padding: 12px 30px;
    font-size: 1rem;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    transition: all 0.3s;
}

.btn-show-answer {
    background: #4B93FF;
    color: white;
}

.btn-show-answer:hover {
    background: #3a7bd5;
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(75, 147, 255, 0.3);
}

.btn-skip {
    background: #e74c3c;
    color: white;
    margin-top: 15px;
}

.btn-skip:hover {
    background: #c0392b;
    transform: translateY(-2px);
}

.rating-section {
    margin-top: 30px;
}

.rating-label {
    font-size: 1rem;
    color: #666;
    margin-bottom: 15px;
}

.rating-buttons {
    display: flex;
    justify-content: center;
    gap: 10px;
    margin-bottom: 15px;
}

.rating-btn {
    width: 50px;
    height: 50px;
    border: 2px solid #ddd;
    border-radius: 50%;
    background: white;
    font-size: 1.2rem;
    font-weight: bold;
    cursor: pointer;
    transition: all 0.3s;
    color: #333;
}

.rating-btn:hover {
    background: #4B93FF;
    color: white;
    border-color: #4B93FF;
    transform: scale(1.1);
    box-shadow: 0 4px 8px rgba(75, 147, 255, 0.3);
}

.rating-btn:active {
    transform: scale(0.95);
}

.rating-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
}

.loading-overlay {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(255, 255, 255, 0.9);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    border-radius: 12px;
    z-index: 10;
}

.spinner {
    border: 4px solid #f3f3f3;
    border-top: 4px solid #4B93FF;
    border-radius: 50%;
    width: 40px;
    height: 40px;
    animation: spin 1s linear infinite;
    margin-bottom: 10px;
}

@keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
}

/* Skeleton Loader */
.skeleton-loader {
    padding: 30px;
}

.skeleton-card {
    background: white;
    border-radius: 12px;
    padding: 30px;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.skeleton-line,
.skeleton-button {
    background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
    background-size: 200% 100%;
    animation: loading 1.5s ease-in-out infinite;
    border-radius: 4px;
}

@keyframes loading {
    0% { background-position: 200% 0; }
    100% { background-position: -200% 0; }
}

.flashcard-header {
    background: #f8f9fa;
    padding: 15px;
    border-radius: 8px;
}

.card-progress {
    font-size: 1.1rem;
    font-weight: 500;
    color: #333;
}

.learning-stats {
    font-size: 0.9rem;
    color: #666;
}

.learning-day {
    font-weight: 500;
    color: #4B93FF;
}
</style>
	<!-- Body Start -->
<div class="wrapper">
    <div class="sa4d25">
        <div class="container-fluid">	
            <div class="row">
                
                <div class="col-xl-9 col-lg-8">
                   <div class="flashcard_section">
                    <!-- Progress and Stats -->
                    <div class="flashcard-header mb-4" style="display: none;">
                        <div class="row">
                            <div class="col-md-6">
                                <div class="progress-info">
                                    <span class="card-progress">Card <span id="current-card-num">0</span> of <span id="total-cards">0</span></span>
                                </div>
                            </div>
                            <div class="col-md-6 text-right">
                                <div class="learning-stats">
                                    <span class="learning-day">Learning Day: <span id="learning-day-num">-</span></span>
                                    <span class="ml-3">New: <span id="new-words-count">0</span> | Recall: <span id="recall-words-count">0</span></span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Flashcard Container -->
                    <div class="flashcard-container" style="max-width: 600px; margin: 0 auto;">
                        <!-- Skeleton Loader -->
                        <div id="skeleton-loader" class="skeleton-loader" style="display: none;">
                            <div class="skeleton-card">
                                <div class="skeleton-line" style="height: 40px; width: 60%; margin-bottom: 20px;"></div>
                                <div class="skeleton-line" style="height: 30px; width: 80%; margin-bottom: 15px;"></div>
                                <div class="skeleton-line" style="height: 30px; width: 70%;"></div>
                                <div class="skeleton-button" style="height: 50px; width: 200px; margin-top: 30px;"></div>
                            </div>
                        </div>

                        <!-- Flashcard -->
                        <div id="flashcard-wrapper" class="flashcard-wrapper" style="display: none;">
                            <div class="flashcard" id="flashcard">
                                <!-- Front Side -->
                                <div class="flashcard-front" id="flashcard-front">
                                    <div class="card-content">
                                        <div class="word-display">
                                            <h2 id="card-word" class="card-word"></h2>
                                            <div id="card-ipa" class="card-ipa"></div>
                                        </div>
                                        <button class="btn-show-answer" id="btn-show-answer">Show Answer</button>
                                    </div>
                                </div>

                                <!-- Back Side -->
                                <div class="flashcard-back" id="flashcard-back" style="display: none;">
                                    <div class="card-content">
                                        <div class="word-display">
                                            <h2 id="back-card-word" class="card-word"></h2>
                                            <div id="back-card-ipa" class="card-ipa"></div>
                                        </div>
                                        <div class="answer-section">
                                            <div id="card-translation" class="card-translation"></div>
                                            <div id="card-examples" class="card-examples"></div>
                                        </div>
                                        <div class="rating-section">
                                            <p class="rating-label">How well did you know this?</p>
                                            <div class="rating-buttons">
                                                <button class="rating-btn" data-rating="1" title="Complete blackout">1</button>
                                                <button class="rating-btn" data-rating="2" title="Incorrect response">2</button>
                                                <button class="rating-btn" data-rating="3" title="Correct response with difficulty">3</button>
                                                <button class="rating-btn" data-rating="4" title="Correct response after hesitation">4</button>
                                                <button class="rating-btn" data-rating="5" title="Perfect response">5</button>
                                            </div>
                                            <button class="btn-skip" id="btn-skip">Skip Word</button>
                                        </div>
                                    </div>
                                </div>

                                <!-- Loading Overlay -->
                                <div class="loading-overlay" id="loading-overlay" style="display: none;">
                                    <div class="spinner"></div>
                                    <p>Saving...</p>
                                </div>
                            </div>
                        </div>

                        <!-- Empty State -->
                        <div id="empty-state" class="empty-state" style="display: none; text-align: center; padding: 40px;">
                            <h4>No cards available</h4>
                            <p>Please select a language and deck to start learning.</p>
                        </div>

                        <!-- Completed State -->
                        <div id="completed-state" class="completed-state" style="display: none; text-align: center; padding: 40px;">
                            <h4>🎉 Great job!</h4>
                            <p>You've completed all cards in this session.</p>
                            <button class="btn btn-primary" onclick="location.reload()">Start New Session</button>
                        </div>
                    </div>
                   </div>
                </div>

                <div class="col-xl-3 col-lg-4 col-md-12">
                    <div class="right_side">
                        <h4>Select Language and Deck</h4>
                        <?php if($user){ ?>
                            <div class="selection-section">
                                <div class="form-group mb-3">
                                    <label for="language-select">Language:</label>
                                    <select class="form-control" id="language-select">
                                        <option value="">-- Select Language --</option>
                                    </select>
                                </div>
                                <div class="form-group mb-3">
                                    <label for="deck-select">Deck:</label>
                                    <select class="form-control" id="deck-select" disabled>
                                        <option value="">-- Select Deck --</option>
                                    </select>
                                </div>
                                <button class="btn btn-primary btn-block" id="btn-start-learning" disabled>Start Learning</button>
                            </div>
                        <?php } else { ?>
                            <p>Please <a href="login.php">login</a> to start learning.</p>
                        <?php }?>
                     
                    </div>
                </div>

            </div>
        </div>
    </div>


<script>
<?php if($user): ?>
// Flashcard Application State
const FlashcardApp = {
    user_id: <?php echo isset($user['id']) ? $user['id'] : 'null'; ?>,
    cards: [],
    currentIndex: 0,
    isFlipped: false,
    isLoading: false,
    language_id: null,
    deck_id: null,
    learningStats: null,

    // Initialize the application
    init: function() {
        this.loadLanguages();
        this.setupEventListeners();
    },

    // Load languages from API
    loadLanguages: function() {
        $.ajax({
            url: 'api/vocab-learning/get-languages.php',
            method: 'GET',
            dataType: 'json',
            success: (response) => {
                if (response.success && response.languages) {
                    const select = $('#language-select');
                    response.languages.forEach(lang => {
                        select.append(`<option value="${lang.id}">${lang.name}</option>`);
                    });
                }
            },
            error: () => {
                alert('Failed to load languages. Please refresh the page.');
            }
        });
    },

    // Setup event listeners
    setupEventListeners: function() {
        // Language selection
        $('#language-select').on('change', () => {
            const languageId = $('#language-select').val();
            if (languageId) {
                this.loadDecks(languageId);
                this.language_id = languageId;
            } else {
                $('#deck-select').html('<option value="">-- Select Deck --</option>').prop('disabled', true);
                $('#btn-start-learning').prop('disabled', true);
            }
        });

        // Deck selection
        $('#deck-select').on('change', () => {
            this.deck_id = $('#deck-select').val();
            $('#btn-start-learning').prop('disabled', !this.deck_id);
        });

        // Start learning button
        $('#btn-start-learning').on('click', () => {
            this.startLearning();
        });

        // Show answer button
        $('#btn-show-answer').on('click', () => {
            this.flipCard();
        });

        // Rating buttons
        $('.rating-btn').on('click', (e) => {
            if (!this.isLoading) {
                const rating = $(e.target).data('rating');
                this.rateCard(rating);
            }
        });

        // Skip button
        $('#btn-skip').on('click', () => {
            if (!this.isLoading) {
                this.skipCard();
            }
        });
    },

    // Load decks for selected language
    loadDecks: function(languageId) {
        $.ajax({
            url: 'api/vocab-learning/get-decks.php',
            method: 'GET',
            data: { language_id: languageId },
            dataType: 'json',
            success: (response) => {
                const select = $('#deck-select');
                select.html('<option value="">-- Select Deck --</option>');
                if (response.success && response.decks) {
                    response.decks.forEach(deck => {
                        select.append(`<option value="${deck.id}">${deck.title}</option>`);
                    });
                    select.prop('disabled', false);
                } else {
                    select.prop('disabled', true);
                }
            },
            error: () => {
                alert('Failed to load decks. Please try again.');
            }
        });
    },

    // Start learning session
    startLearning: function() {
        this.showSkeletonLoader();
        this.hideAllStates();

        $.ajax({
            url: 'api/vocab-learning/get-cards.php',
            method: 'GET',
            data: {
                user_id: this.user_id,
                language_id: this.language_id,
                deck_id: this.deck_id
            },
            dataType: 'json',
            success: (response) => {
                this.hideSkeletonLoader();
                
                if (response.success && response.data && response.data.words) {
                    this.cards = response.data.words;
                    this.learningStats = response.data;
                    
                    if (this.cards.length > 0) {
                        this.displayCard();
                        this.updateProgress();
                        this.updateStats();
                        $('.flashcard-header').show();
                    } else {
                        this.showEmptyState();
                    }
                } else {
                    alert(response.message || 'No cards available for this deck.');
                    this.showEmptyState();
                }
            },
            error: (xhr, status, error) => {
                this.hideSkeletonLoader();
                alert('Failed to load cards. Please try again.');
                console.error('Error:', error);
            }
        });
    },

    // Display current card
    displayCard: function() {
        if (this.currentIndex >= this.cards.length) {
            this.showCompletedState();
            return;
        }

        const card = this.cards[this.currentIndex];
        const cardData = card.card || card;
        const richData = card.rich_data || {};

        // Reset card to front
        this.isFlipped = false;
        $('#flashcard').removeClass('flipped');
        $('#flashcard-front').show();
        $('#flashcard-back').hide();

        // Set front side content
        $('#card-word').text(cardData.word || '');
        $('#card-ipa').text(richData.ipa || '');

        // Set back side content
        $('#back-card-word').text(cardData.word || '');
        $('#back-card-ipa').text(richData.ipa || '');
        $('#card-translation').text(richData.burmese_translation || cardData.burmese_translation || '');

        // Display examples
        let examplesHtml = '';
        if (richData.example_sentences && Array.isArray(richData.example_sentences)) {
            richData.example_sentences.forEach(example => {
                if (example) examplesHtml += `<div class="example">${example}</div>`;
            });
        } else if (cardData.example_sentences) {
            try {
                const examples = JSON.parse(cardData.example_sentences);
                if (Array.isArray(examples)) {
                    examples.forEach(example => {
                        if (example) examplesHtml += `<div class="example">${example}</div>`;
                    });
                }
            } catch (e) {
                // Not JSON, use as is
                examplesHtml = `<div class="example">${cardData.example_sentences}</div>`;
            }
        }
        $('#card-examples').html(examplesHtml || '');

        // Show flashcard
        $('#flashcard-wrapper').show();
        this.updateProgress();
    },

    // Flip card to show answer
    flipCard: function() {
        if (this.isFlipped) return;
        
        this.isFlipped = true;
        $('#flashcard').addClass('flipped');
        $('#flashcard-front').hide();
        $('#flashcard-back').show();
    },

    // Rate card
    rateCard: function(rating) {
        if (this.isLoading) return;

        const card = this.cards[this.currentIndex];
        const cardId = card.card ? card.card.id : card.id;

        this.showLoading();
        this.disableButtons();

        $.ajax({
            url: 'api/vocab-learning/rate-word.php',
            method: 'POST',
            data: {
                user_id: this.user_id,
                card_id: cardId,
                quality: rating
            },
            dataType: 'json',
            success: (response) => {
                this.hideLoading();
                this.enableButtons();

                if (response.success) {
                    // Move to next card
                    this.currentIndex++;
                    if (this.currentIndex < this.cards.length) {
                        this.displayCard();
                    } else {
                        this.showCompletedState();
                    }
                } else {
                    alert(response.message || 'Failed to save rating. Please try again.');
                }
            },
            error: (xhr, status, error) => {
                this.hideLoading();
                this.enableButtons();
                alert('Failed to save rating. Please try again.');
                console.error('Error:', error);
            }
        });
    },

    // Skip card
    skipCard: function() {
        if (this.isLoading) return;

        const card = this.cards[this.currentIndex];
        const cardId = card.card ? card.card.id : card.id;

        // Get all card IDs in current session
        const sessionCardIds = this.cards.map(c => (c.card ? c.card.id : c.id));

        this.showLoading();
        this.disableButtons();

        $.ajax({
            url: 'api/vocab-learning/skip-word.php',
            method: 'POST',
            data: {
                user_id: this.user_id,
                card_id: cardId,
                language_id: this.language_id,
                deck_id: this.deck_id,
                session_card_ids: JSON.stringify(sessionCardIds)
            },
            dataType: 'json',
            success: (response) => {
                this.hideLoading();
                this.enableButtons();

                if (response.success) {
                    // Replace current card with replacement word
                    if (response.data && response.data.replacement_word) {
                        this.cards[this.currentIndex] = response.data.replacement_word;
                        this.displayCard();
                    } else {
                        // No replacement, move to next
                        this.currentIndex++;
                        if (this.currentIndex < this.cards.length) {
                            this.displayCard();
                        } else {
                            this.showCompletedState();
                        }
                    }
                } else {
                    alert(response.message || 'Failed to skip word. Please try again.');
                }
            },
            error: (xhr, status, error) => {
                this.hideLoading();
                this.enableButtons();
                alert('Failed to skip word. Please try again.');
                console.error('Error:', error);
            }
        });
    },

    // Update progress indicator
    updateProgress: function() {
        $('#current-card-num').text(this.currentIndex + 1);
        $('#total-cards').text(this.cards.length);
    },

    // Update learning stats
    updateStats: function() {
        if (this.learningStats) {
            $('#learning-day-num').text(this.learningStats.learning_day_number || '-');
            if (this.learningStats.word_counts) {
                $('#new-words-count').text(this.learningStats.word_counts.new_words || 0);
                $('#recall-words-count').text(this.learningStats.word_counts.recall_words || 0);
            }
        }
    },

    // Show/hide states
    showSkeletonLoader: function() {
        $('#skeleton-loader').show();
        this.hideAllStates();
    },

    hideSkeletonLoader: function() {
        $('#skeleton-loader').hide();
    },

    showEmptyState: function() {
        $('#empty-state').show();
        $('#flashcard-wrapper').hide();
        $('.flashcard-header').hide();
    },

    showCompletedState: function() {
        $('#completed-state').show();
        $('#flashcard-wrapper').hide();
    },

    hideAllStates: function() {
        $('#skeleton-loader').hide();
        $('#flashcard-wrapper').hide();
        $('#empty-state').hide();
        $('#completed-state').hide();
    },

    showLoading: function() {
        this.isLoading = true;
        $('#loading-overlay').show();
    },

    hideLoading: function() {
        this.isLoading = false;
        $('#loading-overlay').hide();
    },

    disableButtons: function() {
        $('.rating-btn, #btn-skip').prop('disabled', true);
    },

    enableButtons: function() {
        $('.rating-btn, #btn-skip').prop('disabled', false);
    }
};
<?php endif; ?>

// Initialize when document is ready
$(document).ready(function() {
    <?php if($user): ?>
    FlashcardApp.init();
    <?php endif; ?>
});
</script>

<?php 
    include('layouts/footer.php');
?>