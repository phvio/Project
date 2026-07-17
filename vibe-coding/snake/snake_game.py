"""
Snake Game - A classic snake game built with Python and Pygame.

Controls:
  - Arrow Keys / WASD: Move the snake
  - P: Pause / Resume
  - R: Restart after game over
  - Q / ESC: Quit
"""

import random
import sys
from collections import deque
from enum import Enum

import pygame

# ── Constants ────────────────────────────────────────────────────────────────

CELL_SIZE  = 20
GRID_WIDTH  = 30
GRID_HEIGHT = 20

WINDOW_WIDTH  = CELL_SIZE * GRID_WIDTH
WINDOW_HEIGHT = CELL_SIZE * GRID_HEIGHT + 60  # extra space for score bar

FPS = 8

# Colors
COLOR_BG         = (20,  20,  30)
COLOR_GRID       = (35,  35,  50)
COLOR_SNAKE_HEAD = (100, 220, 100)
COLOR_SNAKE_BODY = (60,  180, 60)
COLOR_FOOD       = (240, 80,  80)
COLOR_SCORE      = (220, 220, 220)
COLOR_OVERLAY    = (0,   0,   0,  160)


class Direction(Enum):
    UP    = (0, -1)
    DOWN  = (0,  1)
    LEFT  = (-1, 0)
    RIGHT = (1,  0)

    @staticmethod
    def opposite(d: "Direction") -> "Direction":
        opposites = {
            Direction.UP:    Direction.DOWN,
            Direction.DOWN:  Direction.UP,
            Direction.LEFT:  Direction.RIGHT,
            Direction.RIGHT: Direction.LEFT,
        }
        return opposites[d]


class SnakeGame:
    """Core game logic, decoupled from rendering."""

    def __init__(self) -> None:
        self.reset()

    # ── public API ───────────────────────────────────────────────────────

    def reset(self) -> None:
        """Reset the game to its initial state."""
        start_x = GRID_WIDTH // 2
        start_y = GRID_HEIGHT // 2
        self.snake: deque[tuple[int, int]] = deque([
            (start_x,     start_y),
            (start_x - 1, start_y),
            (start_x - 2, start_y),
        ])
        self.direction = Direction.RIGHT
        self._next_direction = Direction.RIGHT
        self.food = self._random_food()
        self.score = 0
        self.game_over = False

    def set_direction(self, d: Direction) -> None:
        """Queue a direction change (ignored if it would reverse)."""
        if d != Direction.opposite(self.direction):
            self._next_direction = d

    def tick(self) -> None:
        """Advance the game by one frame.  Returns early when game-over."""
        if self.game_over:
            return

        self.direction = self._next_direction

        head_x, head_y = self.snake[0]
        dx, dy = self.direction.value
        new_head = (head_x + dx, head_y + dy)

        # Wrap around edges
        new_head = (new_head[0] % GRID_WIDTH, new_head[1] % GRID_HEIGHT)

        # Self collision (check against body *before* the tail moves)
        if new_head in self.snake:
            self.game_over = True
            return

        self.snake.appendleft(new_head)

        if new_head == self.food:
            self.score += 1
            self.food = self._random_food()
        else:
            self.snake.pop()

    # ── helpers ──────────────────────────────────────────────────────────

    def _random_food(self) -> tuple[int, int]:
        """Return a random cell not occupied by the snake."""
        occupied = set(self.snake)
        while True:
            pos = (random.randrange(GRID_WIDTH), random.randrange(GRID_HEIGHT))
            if pos not in occupied:
                return pos


# ── Rendering ────────────────────────────────────────────────────────────────

class Renderer:
    """Draws the game state onto a Pygame surface."""

    def __init__(self, screen: pygame.Surface, font: pygame.font.Font) -> None:
        self.screen = screen
        self.font = font

    def draw(self, game: SnakeGame) -> None:
        self._draw_background()
        self._draw_grid()
        self._draw_snake(game)
        self._draw_food(game)
        self._draw_score(game)
        if game.game_over:
            self._draw_game_over(game)

    def _draw_background(self) -> None:
        self.screen.fill(COLOR_BG)

    def _draw_grid(self) -> None:
        for x in range(GRID_WIDTH):
            for y in range(GRID_HEIGHT):
                rect = pygame.Rect(x * CELL_SIZE, y * CELL_SIZE, CELL_SIZE, CELL_SIZE)
                pygame.draw.rect(self.screen, COLOR_GRID, rect, 1)

    def _draw_snake(self, game: SnakeGame) -> None:
        for i, (sx, sy) in enumerate(game.snake):
            rect = pygame.Rect(sx * CELL_SIZE + 1, sy * CELL_SIZE + 1,
                               CELL_SIZE - 2, CELL_SIZE - 2)
            color = COLOR_SNAKE_HEAD if i == 0 else COLOR_SNAKE_BODY
            pygame.draw.rect(self.screen, color, rect, border_radius=4)

    def _draw_food(self, game: SnakeGame) -> None:
        fx, fy = game.food
        center = (fx * CELL_SIZE + CELL_SIZE // 2, fy * CELL_SIZE + CELL_SIZE // 2)
        pygame.draw.circle(self.screen, COLOR_FOOD, center, CELL_SIZE // 2 - 2)

    def _draw_score(self, game: SnakeGame) -> None:
        text = self.font.render(f"Score: {game.score}", True, COLOR_SCORE)
        self.screen.blit(text, (12, GRID_HEIGHT * CELL_SIZE + 12))

    def _draw_game_over(self, game: SnakeGame) -> None:
        # Semi-transparent overlay
        overlay = pygame.Surface((WINDOW_WIDTH, GRID_HEIGHT * CELL_SIZE), pygame.SRCALPHA)
        overlay.fill(COLOR_OVERLAY)
        self.screen.blit(overlay, (0, 0))

        lines = [
            "GAME OVER",
            f"Final Score: {game.score}",
            "Press R to restart  |  Q to quit",
        ]
        y_offset = GRID_HEIGHT * CELL_SIZE // 2 - 30
        for line in lines:
            surf = self.font.render(line, True, COLOR_SCORE)
            x = WINDOW_WIDTH // 2 - surf.get_width() // 2
            self.screen.blit(surf, (x, y_offset))
            y_offset += 28


# ── Main loop ────────────────────────────────────────────────────────────────

def main() -> None:
    pygame.init()
    screen = pygame.display.set_mode((WINDOW_WIDTH, WINDOW_HEIGHT))
    pygame.display.set_caption("Snake Game")
    clock = pygame.time.Clock()
    font = pygame.font.SysFont("monospace", 22, bold=True)

    game = SnakeGame()
    renderer = Renderer(screen, font)

    paused = False

    while True:
        # ── Event handling ────────────────────────────────────────────
        for event in pygame.event.get():
            if event.type == pygame.QUIT:
                pygame.quit()
                sys.exit()

            if event.type == pygame.KEYDOWN:
                if event.key in (pygame.K_ESCAPE, pygame.K_q):
                    pygame.quit()
                    sys.exit()

                if game.game_over:
                    if event.key == pygame.K_r:
                        game.reset()
                        paused = False
                    continue  # ignore other keys when game is over

                if event.key == pygame.K_p:
                    paused = not paused

                if not paused:
                    if event.key in (pygame.K_UP,    pygame.K_w):
                        game.set_direction(Direction.UP)
                    elif event.key in (pygame.K_DOWN,  pygame.K_s):
                        game.set_direction(Direction.DOWN)
                    elif event.key in (pygame.K_LEFT,  pygame.K_a):
                        game.set_direction(Direction.LEFT)
                    elif event.key in (pygame.K_RIGHT, pygame.K_d):
                        game.set_direction(Direction.RIGHT)

        # ── Game logic ────────────────────────────────────────────────
        if not paused and not game.game_over:
            game.tick()

        # ── Rendering ─────────────────────────────────────────────────
        renderer.draw(game)
        pygame.display.flip()
        clock.tick(FPS)


if __name__ == "__main__":
    main()
