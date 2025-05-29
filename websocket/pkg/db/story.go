package db

import (
	"log"
)

type Vote struct {
	MemberID  string `json:"memberId"`
	StoryID   string `json:"storyId"`
	Vote      *int    `json:"vote"`
	CreatedAt string `json:"createdAt"`
}

func GetStoryVotes(storyID string) ([]Vote, error) {
	rows, err := DB.Query("SELECT storyId, memberId, vote, createdAt FROM votes WHERE storyId = ?", storyID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var votes []Vote
	for rows.Next() {
		var vote Vote
		err := rows.Scan(&vote.StoryID, &vote.MemberID, &vote.Vote, &vote.CreatedAt)
		if err != nil {
			log.Fatal("Error scanning story votes:", err)
			return nil, err
		}
		votes = append(votes, vote)
	}

	return votes, nil
}
