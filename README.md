# 📈 Visual Markets

This oTree app is designed to visualize continuous double auction markets using heatmaps, utility grids, and other dynamic elements. 

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
```

## 📦 Required Dependencies

To run this app successfully, you must also include the following apps in your project directory:

- [`otree_redwood`](https://github.com/Leeps-Lab/otree-redwood)
- [`otree_markets`](https://github.com/Leeps-Lab/otree_markets)

Make sure these folders are present **at the same level** as `otree_visual_markets`, for example:

your_project/
├── otree_redwood/
├── otree_markets/
├── otree_visual_markets/
├── settings.py
├── manage.py



## ⚙️ Setup Instructions for Visual Markets (oTree 3.x)

These steps help you set up and run the **Visual Markets** app with oTree 3.x.  
🛑 This version is NOT compatible with oTree Lite (5+).


---


### 1. Clone the repository

```bash
git clone https://github.com/Leeps-Lab/otree_visual_markets.git
cd otree_visual_markets
```

### 2. Create and activate a virtual environment

```bash
pyenv local 3.7.17
python3 -m venv venv
source venv/bin/activate
```

### 3. Install the required packages

If you have a `requirements.txt`, install with:

```bash
pip install -r requirements.txt
```

Or install manually:

```bash
pip install numpy pandas js2py pyyaml channels otree-redwood otree-core
```

### 4. Run the development server

```bash
otree devserver
```

Then open your browser to:  
[http://localhost:8000](http://localhost:8000)

---

### Note

Do **not** run `otree update_my_code` or upgrade to oTree 5, or this app may stop working.
