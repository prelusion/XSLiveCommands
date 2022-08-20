from pathlib import Path

from AoE2ScenarioParser.scenarios.aoe2_de_scenario import AoE2DEScenario

scenario_folder = "" # todo: replace the empty string with your scenario directory path
scenario_file = "random2p"  # Don't include the '.aoe2scenario' extension
scenario_output_file = "OUTPUT"

folder = Path(__file__).parent
file_path = Path(scenario_folder) / (scenario_file + '.aoe2scenario')
output_file_path = Path(scenario_folder) / (scenario_output_file + '.aoe2scenario')

scenario = AoE2DEScenario.from_file(str(file_path.resolve()))
scenario.xs_manager.add_script(str((folder / 'ext_core.xs').resolve()))
scenario.xs_manager.add_script(str((folder / 'starter.xs').resolve()))
scenario.write_to_file(str(output_file_path.resolve()))
