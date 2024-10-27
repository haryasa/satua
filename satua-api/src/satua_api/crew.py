from crewai import Agent, Crew, Process, Task
from crewai.project import CrewBase, agent, crew, task
from crewai_tools import DallETool

@CrewBase
class SatuaApiCrew():
	"""SatuaApi crew"""

	@agent
	def story_writer(self) -> Agent:
		return Agent(
			config=self.agents_config['story_writer'],
			verbose=True
		)
	
	@agent
	def story_reviewer(self) -> Agent:
		return Agent(
			config=self.agents_config['story_reviewer'],
			verbose=True
		)

	@task
	def write_story_idea_task(self) -> Task:
		return Task(
			config=self.tasks_config['write_story_idea_task'],
			output_file='.output/story_idea.md'
		)

	@task
	def review_story_idea_task(self) -> Task:
		return Task(
			config=self.tasks_config['review_story_idea_task'],
			output_file='.output/review.md'
		)

	@task
	def improve_story_idea_task(self) -> Task:
		return Task(
			config=self.tasks_config['improve_story_idea_task'],
			output_file='.output/final_story_idea.md'
		)

	@crew
	def crew(self) -> Crew:
		"""Creates the SatuaApi crew"""
		return Crew(
			agents=self.agents,
			tasks=self.tasks,
			process=Process.sequential,
			verbose=True,
		)