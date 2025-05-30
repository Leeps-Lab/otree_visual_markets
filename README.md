# 📈 Visual Markets

This oTree app is designed to visualize continuous double auction markets using heatmaps, utility grids, and other dynamic elements. It is **built for oTree 3.x** and is **not compatible with oTree Lite (oTree 5+)**.

## 🔧 Example Session Config

Add the following to your `SESSION_CONFIGS` in `settings.py`:

```python
dict(
   name='otree_visual_markets',
   display_name='Visual Markets',
   num_demo_participants=2,
   app_sequence=['otree_visual_markets'],
   session_config_file='demo.txt',
),
