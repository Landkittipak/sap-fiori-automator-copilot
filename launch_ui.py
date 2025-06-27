from computer.ui.gradio.app import create_gradio_ui
from dotenv import load_dotenv
load_dotenv('.env')

app = create_gradio_ui()
app.launch(share=False) 